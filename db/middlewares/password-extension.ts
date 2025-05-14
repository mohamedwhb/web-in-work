import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const passwordExtension = Prisma.defineExtension({
  name: "passwordExtension",
  query: {
    user: {
      async create({ args, query }: any) {
        if (args.data.password && typeof args.data.password === "string") {
          args.data.password = await bcrypt.hash(
            args.data.password,
            saltRounds
          );
        }
        return query(args);
      },
      async update({ args, query }: any) {
        if (args.data.password && typeof args.data.password === "string") {
          args.data.password = await bcrypt.hash(
            args.data.password,
            saltRounds
          );
        }
        return query(args);
      },
    },
  },
});
