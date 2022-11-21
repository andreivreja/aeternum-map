import { Router } from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';
import multer from 'multer';
import { SCREENSHOTS_PATH } from '../env.js';
import { getScreenshotsCollection } from './collection.js';
import { ensureAuthenticated } from '../auth/middlewares.js';
import { uploadToDiscord } from '../discord.js';
import { worlds } from 'static';
import { Blob } from 'node-fetch';
import { getInfluencesCollection } from '../influences/collection.js';

const screenshotsUpload = multer({ dest: SCREENSHOTS_PATH });

const screenshotsRouter = Router();

screenshotsRouter.post(
  '/',
  screenshotsUpload.single('screenshot'),
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).send('Invalid payload');
        return;
      }

      const filePath = `${req.file.path}.webp`;
      await sharp(req.file.path).webp().toFile(filePath);
      await fs.rm(req.file.path);

      const screenshot = await getScreenshotsCollection().insertOne({
        filename: `${req.file.filename}.webp`,
        createdAt: new Date(),
      });

      res.json({
        screenshotId: screenshot.insertedId,
      });
    } catch (error) {
      next(error);
    }
  }
);

screenshotsRouter.post(
  '/influences',
  screenshotsUpload.single('screenshot'),
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;

      if (!account.isModerator) {
        res.status(401).send('Moderators only');
        return;
      }
      if (!req.file || !req.body.worldName || !req.body.influence) {
        res.status(400).send('Invalid payload');
        return;
      }
      const world = worlds.find(
        (world) => world.worldName === req.body.worldName
      );
      if (!world) {
        res.status(404).send(`Can not find ${req.body.worldName}`);
        return;
      }

      const influence = JSON.parse(req.body.influence);
      const buffer = await sharp(req.file.path).webp().toBuffer();
      const blob = new Blob([buffer]);
      await fs.rm(req.file.path);
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);

      const todaysInfluences = await getInfluencesCollection().countDocuments({
        worldName: world.worldName,
        influence,
        createdAt: {
          $gte: midnight,
        },
      });
      if (todaysInfluences > 0) {
        res.status(400).send('Same influence for today already exists');
        return;
      }

      const insertResult = await getInfluencesCollection().insertOne({
        worldName: world.worldName,
        influence,
        createdAt: now,
      });
      if (!insertResult.acknowledged) {
        res.status(500).send('Could not insert influence');
        return;
      }

      const webhookUrl =
        process.env[
          `DISCORD_${world.publicName
            .toUpperCase()
            .replaceAll(' ', '')}_WEBHOOK_URL`
        ] ||
        'https://discord.com/api/webhooks/1041621984896892939/HKaFtMurX4nWgnphfcayBjXgLDzKOrpPwSZleJ4tZpcM8syIgZnoWe1wNpf0kLjeJjZ9';

      const response = await uploadToDiscord(
        blob,
        `**Server**: ${world.publicName}\n**User**: ${
          account.name
        }\n**Date**: ${now.toLocaleDateString()}`,
        webhookUrl
      );
      const result = await response.json();
      res.status(response.status).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default screenshotsRouter;
