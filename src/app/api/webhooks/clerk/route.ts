import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
    return new Response('Webhook Secret required', { status: 400 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      await db.profile.create({
        data: {
          userId: payload.data.id,
          username: payload.data.username || `user_${payload.data.id.slice(0, 5)}`,
          email: payload.data.email_addresses[0].email_address,
          imageUrl: payload.data.image_url,
        }
      });
      console.log(`Profile created for user ${payload.data.id}`);
    } catch (dbError) {
      console.error("WEBHOOK ERROR: Failed to create profile in DB. Check your DATABASE_URL in .env");
      console.error(dbError);
      // We return 200 anyway so Clerk doesn't block the signup, 
      // but the user won't have a profile yet.
    }
  }

  if (eventType === "user.updated") {
    try {
      await db.profile.update({
        where: {
          userId: payload.data.id,
        },
        data: {
          username: payload.data.username || `user_${payload.data.id.slice(0, 5)}`,
          email: payload.data.email_addresses[0].email_address,
          imageUrl: payload.data.image_url,
        }
      });
    } catch (dbError) {
      console.error("WEBHOOK ERROR: Failed to update profile in DB.");
    }
  }

  return new Response('', { status: 200 });
}
