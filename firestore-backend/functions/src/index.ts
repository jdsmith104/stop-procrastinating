import * as functions from 'firebase-functions';
import {Request, Response} from 'firebase-functions';
import HTPPResponseStatus, {createErrorResponse} from './httpResponseStatus';
import {db, defaultCollectionName} from './config/firebase';
import {QueryDocumentSnapshot} from 'firebase-functions/v1/firestore';

interface Datum {
  datetime: Date;
}

// GET request
exports.getData = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    // Allow requests
    res.set('Access-Control-Allow-Origin', '*');
    // Check request method
    if (req.method != 'GET') {
      throw new Error('Invalid request type');
    }

    const querySnapshot: FirebaseFirestore.QuerySnapshot = await db
      .collection(defaultCollectionName)
      .get();

    const data: unknown[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      functions.logger.info('Type of doc: ', typeof doc, {structuredData: true});
      // doc.data() is never undefined for query doc snapshots
      data.push(doc.data());
    });

    // Response
    res.status(HTPPResponseStatus.OK);
    res.json({data: data});
  } catch (error: any) {
    res.status(HTPPResponseStatus.FAILED);
    res.json(createErrorResponse('Server error', error?.message));
  }
});

// POST request
exports.addDatum = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    // Allow requests
    res.set('Access-Control-Allow-Origin', '*');
    // Check request method
    if (req.method != 'POST') {
      throw new Error('Invalid request type');
    }

    const newDatum: Datum = {datetime: new Date()};

    const writeResult = await db.collection(defaultCollectionName).add(newDatum);
    const id = writeResult.id;
    res.status(HTPPResponseStatus.CREATED);
    res.json({data: `Date with ID: ${id} added.`});
  } catch (error: any) {
    res.status(HTPPResponseStatus.FAILED);
    res.json(createErrorResponse('Server error', error?.message));
  }
});
