import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { assertCsrf, requireAdminSession, type AdminSession } from "../_lib/auth.js";
import {
  ApiError,
  type ApiRequest,
  type ApiResponse,
  assertSameOriginMutation,
  parseJsonBody,
  sendError,
  setApiHeaders,
} from "../_lib/http.js";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setApiHeaders(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed.", code: "method_not_allowed" });
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new ApiError(503, "Image uploads are not configured. Paste an HTTPS image URL instead.", "blob_unavailable");
    }
    const body = parseJsonBody<HandleUploadBody>(req);
    const bodyType = (body as unknown as { type?: string }).type;
    let session: AdminSession | null = null;
    if (bodyType === "blob.generate-client-token") {
      assertSameOriginMutation(req);
      session = await requireAdminSession(req);
    }

    const response = await handleUpload({
      request: req as never,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!session) throw new ApiError(401, "Sign in before uploading images.", "unauthorized");
        let payload: { csrfToken?: string } = {};
        try {
          payload = JSON.parse(clientPayload || "{}") as { csrfToken?: string };
        } catch {
          throw new ApiError(400, "The upload security payload is invalid.", "invalid_upload_payload");
        }
        assertCsrf(req, session, payload.csrfToken);
        if (!pathname.startsWith("portfolio/")) {
          throw new ApiError(400, "The upload path is invalid.", "invalid_upload_path");
        }
        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.userId }),
        };
      },
      onUploadCompleted: async () => {
        // The project record is updated only when the admin explicitly saves it.
      },
    });
    return res.status(200).json(response);
  } catch (error) {
    return sendError(res, error, "CMS image upload error");
  }
}
