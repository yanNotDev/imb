import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "~/env.mjs";

type Data = {
  isAdmin: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ isAdmin: false });
  }

  const isAdmin = env.ADMIN_EMAILS.split(",").includes(email);
  return res.status(200).json({ isAdmin });
} 