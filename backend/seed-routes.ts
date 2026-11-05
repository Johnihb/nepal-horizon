import { prisma } from "./lib/prisma.ts";

const routes: Record<string, {
  points: [number, number][];
  elevation: number[];
  stops: { name: string; x: number; y: number; type: string }[];
}> = {
  "Arnapurna treck": {
    points: [[32, 62], [36, 52], [42, 42], [48, 36], [52, 46], [47, 58], [40, 62]],
    elevation: [820, 1500, 2500, 3500, 5416, 3800, 2000],
    stops: [
      { name: "Pokhara", x: 32, y: 62, type: "start" },
      { name: "Manang", x: 42, y: 42, type: "village" },
      { name: "Thorong La", x: 48, y: 36, type: "pass" },
      { name: "Muktinath", x: 52, y: 46, type: "village" },
      { name: "Jomsom", x: 47, y: 58, type: "end" },
    ],
  },
  "Everest Base Camp Trek": {
    points: [[78, 68], [76, 58], [74, 50], [72, 42], [70, 36], [68, 32]],
    elevation: [2860, 3440, 3860, 4410, 4940, 5364],
    stops: [
      { name: "Lukla", x: 78, y: 68, type: "start" },
      { name: "Namche", x: 76, y: 58, type: "village" },
      { name: "Tengboche", x: 74, y: 50, type: "village" },
      { name: "Dingboche", x: 72, y: 42, type: "village" },
      { name: "EBC", x: 68, y: 32, type: "end" },
    ],
  },
  "Ghorepani Poon Hill Trek": {
    points: [[34, 70], [36, 64], [38, 58], [40, 52]],
    elevation: [1000, 1500, 2000, 3210],
    stops: [
      { name: "Nayapul", x: 34, y: 70, type: "start" },
      { name: "Ghorepani", x: 38, y: 58, type: "village" },
      { name: "Poon Hill", x: 40, y: 52, type: "pass" },
    ],
  },
  "Pokhara Adventure Escape": {
    points: [[32, 64], [34, 60], [36, 56]],
    elevation: [800, 1000, 1200],
    stops: [
      { name: "Pokhara", x: 32, y: 64, type: "start" },
      { name: "Sarangkot", x: 36, y: 56, type: "end" },
    ],
  },
  "Lumbini Spiritual Journey": {
    points: [[22, 82], [24, 80]],
    elevation: [150, 160],
    stops: [
      { name: "Lumbini", x: 22, y: 82, type: "start" },
      { name: "Maya Devi", x: 24, y: 80, type: "end" },
    ],
  },
};

async function main() {
  for (const [name, route] of Object.entries(routes)) {
    const updated = await prisma.package.updateMany({
      where: { name },
      data: { route },
    });
    console.log(`${name}: ${updated.count} updated`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});