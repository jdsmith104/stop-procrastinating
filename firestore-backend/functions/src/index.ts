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

/**
 * @param  {unknown} rawMonth
 * @return {number} int for month (zero indexed)
 */
function parseMonth(rawMonth: unknown): number {
  const VALID_MONTHS_MAP: Map<string, number> = new Map([
    ['jan', 0],
    ['feb', 1],
    ['mar', 2],
    ['apr', 3],
    ['may', 4],
    ['jun', 5],
    ['jul', 6],
    ['aug', 7],
    ['sep', 8],
    ['oct', 9],
    ['nov', 10],
    ['dec', 11],
  ]);
  if (rawMonth && (typeof rawMonth === 'string' || rawMonth instanceof String)) {
    const monthInt = VALID_MONTHS_MAP.get(rawMonth.toString().toLowerCase());
    if (monthInt) {
      return monthInt;
    }
  }
  throw new Error('Failed to parse month. Should be in format xxx: apr, may, jul.');
}

/**
 * @param  {any} rawYear
 * @return {string} String for month
 */
function parseYear(rawYear: unknown): string {
  if (rawYear && (typeof rawYear === 'string' || rawYear instanceof String)) {
    if (rawYear.length == 4) {
      return rawYear.toString();
    }
  }
  throw new Error('Failed to parse year. Expect format xxxx: 2022, 2021, 1989.');
}
/** Convert integeter to month
 * @param  {number} monthInt
 * @return {string}
 */
function intToMonth(monthInt: number): string {
  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  // Mod to account for wrapping
  monthInt = monthInt % 12;
  if (monthInt > 11 || monthInt < 0) {
    throw new Error('Invalid monthInt');
  }
  return MONTHS[monthInt];
}

// GET request
exports.getDataFromMonth = functions.https.onRequest(
  async (req: Request, res: Response) => {
    try {
      // Allow requests
      res.set('Access-Control-Allow-Origin', '*');
      // Check request method
      if (req.method != 'GET') {
        throw new Error('Invalid request type');
      }

      // May throw
      const month = parseMonth(req.query?.month);
      const year = parseYear(req.query?.year);

      // Get minimum date for the month
      const filterMinDate: Date = new Date(
        `${intToMonth(month)} 1, ${year} 00:00:00`,
      );

      // Get maximum date for the month
      const filterMaxDate: Date = new Date(
        `${intToMonth(month + 1)} 1, ${year} 00:00:00`,
      );

      // Get all data in db
      const querySnapshot: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> =
        db.collection(defaultCollectionName);

      // Find all dates that are less than the max date
      let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
        querySnapshot.where('datetime', '<', filterMaxDate);

      // Find all dates greater than the min date
      query = query.where('datetime', '>=', filterMinDate);

      // Get filtered collection result
      const filteredCollection = await query.get();

      // Create array of filtered data
      const data = filteredCollection.docs.map((doc) => {
        return doc.data();
      });

      // Response
      res.status(HTPPResponseStatus.OK);
      res.json({data: data});
    } catch (error: any) {
      res.status(HTPPResponseStatus.FAILED);
      res.json(createErrorResponse('Server error', error?.message));
    }
  },
);

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
