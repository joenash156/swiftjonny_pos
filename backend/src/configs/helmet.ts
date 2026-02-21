import helmet from "helmet";

export const helmetConfig = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
});