import { type NextApiRequest, type NextApiResponse } from "next";
import firestore from "../../firebase";

type Data =
  | {
      data: unknown;
    }
  | {
      message: string;
    };

interface Team {
  teamName: string;
  teamMembers: string;
  email: string;
  answers: Record<string, number>; // Map of question IDs to integer answers
  image: string;
  username: string;
  started: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Record<string, string>>
) {
  try {
    // Create a reference to the user's collection
    const userCollectionRef = firestore.collection("users");

    // Get all documents in the collection
    const snapshot = await userCollectionRef.get();

    // Create an object to hold the user data
    const userData: Record<string, string> = {};

    // Concatenate all emails into a single string
    let emailsString = "";
    snapshot.forEach((doc) => {
      const data = doc.data() as Team;
      emailsString += data.email + " ";
    });

    // Assign the emails string to the key "whatever" in the userData object
    userData["Test_Emails"] = emailsString.trim(); // Remove trailing space

    return res.status(200).json(userData); // return the userData object
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get data" });
  }
}
