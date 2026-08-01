import { prisma } from "../config/prismaClient";

export async function generateUsername(displayName: string) {
    let base = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

    let username = base;
    let counter = 1;

    while (await prisma.user.findUnique({ where: { username } })) {
        username = `${base}${counter}`;
        counter++;
    }

    return username;
}
