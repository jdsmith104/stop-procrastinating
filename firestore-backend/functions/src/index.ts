import * as functions from 'firebase-functions';
import {Request, Response} from 'firebase-functions';
import HTPPResponseStatus, {createErrorResponse} from './httpResponseStatus';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  response.send('Hello from Firebase!');
});

// GET request
exports.testFunction = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      // Allow requests
      res.set('Access-Control-Allow-Origin', '*');
      // Check request method
      if (req.method != 'GET') {
        throw new Error('Invalid request type');
      }
      // Log information
      functions.logger.info('Hello logs!', {structuredData: true});
      // Response
      res.status(HTPPResponseStatus.OK);
      res.send('Hello from Firebase!');
    } catch (error: any) {
      res.status(HTPPResponseStatus.FAILED);
      res.json(createErrorResponse('Server error', error?.message));
    }
  },
);
