import { db } from "../lib/db";
import { categories, products, productImages } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function seedLiveCatalog() {
  if (!db) {
    console.error("Database connection unavailable.");
    process.exit(1);
  }

  console.log("Seeding vibrant, realistic boutique catalog...");

  // 1. Update or create the "Chair" category so the user's current URL has stunning content
  const existingChair = await db.select().from(categories).where(eq(categories.slug, "chair"));
  let chairId = "cat-chair";

  if (existingChair.length > 0) {
    chairId = existingChair[0].id;
    await db
      .update(categories)
      .set({
        name: "Lounge & Seating",
        description: "Sculptural accent chairs, ergonomic loungers, and handcrafted seating designed for comfort and modern architectural spaces.",
        image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80",
        isActive: true,
        displayOrder: 1,
      })
      .where(eq(categories.id, chairId));
    console.log("Updated existing 'chair' category.");
  } else {
    await db.insert(categories).values({
      id: chairId,
      name: "Lounge & Seating",
      slug: "chair",
      description: "Sculptural accent chairs, ergonomic loungers, and handcrafted seating designed for comfort and modern architectural spaces.",
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
      displayOrder: 1,
    });
    console.log("Created 'chair' category.");
  }

  // 2. Add other luxury categories
  const otherCategories = [
    {
      id: "cat-lighting",
      name: "Lighting & Ambience",
      slug: "lighting",
      description: "Atmospheric ceramic table lamps, fluted glass pendants, and warm ambient lighting fixtures for cozy evenings.",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
      displayOrder: 2,
    },
    {
      id: "cat-decor",
      name: "Vessels & Sculptural Objects",
      slug: "decor",
      description: "Tactile stoneware vases, travertine bookends, and handcrafted ceramic vessels celebrating organic geometry.",
      image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80",
      displayOrder: 3,
    },
    {
      id: "cat-living",
      name: "Textiles & Daily Rituals",
      slug: "living",
      description: "Washed European linen throws, heavyweight waffle cotton blankets, and tactile sensory accents.",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
      displayOrder: 4,
    },
  ];

  for (const cat of otherCategories) {
    const exists = await db.select().from(categories).where(eq(categories.slug, cat.slug));
    if (exists.length === 0) {
      await db.insert(categories).values({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        isActive: true,
        displayOrder: cat.displayOrder,
      });
      console.log(`Created category: ${cat.name}`);
    }
  }

  // 3. Clear any dummy products and insert a rich catalog
  const catalogProducts = [
    {
      id: "prod-scandi-chair",
      title: "Nordic Bouclé Curved Lounge Chair with Oak Legs",
      slug: "nordic-boucle-curved-lounge-chair",
      brand: "Studio Aalto",
      categoryId: chairId,
      shortDescription: "Plush cream textured bouclé upholstery paired with solid matte-lacquered European white oak legs.",
      description: "The Nordic Bouclé Lounge Chair balances generous comfort with an airy silhouette. Featuring a barrel-curved backrest, deep foam cushioning, and sustainable solid oak framing, this sculptural piece anchors any reading corner or minimalist living room.\n\n• Upholstery: 100% Wool-blend bouclé\n• Frame: Kiln-dried solid European white oak\n• Dimensions: 31\"W x 30\"D x 29\"H\n• Fulfillment: Dispatched via Amazon Prime with protective white-glove packaging.",
      tags: ["lounge", "boucle", "seating", "minimalist", "nordic"],
      featured: true,
      recommended: true,
      amazonUrl: "https://www.amazon.com/dp/B08N5WRWNW",
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      id: "prod-cane-armchair",
      title: "Handcrafted Rattan & Teak Minimalist Accent Chair",
      slug: "handcrafted-rattan-teak-accent-chair",
      brand: "Maison Ritual",
      categoryId: chairId,
      shortDescription: "Geometric mid-century silhouette hand-woven with natural French cane and solid plantation teak.",
      description: "A tribute to classic mid-century modernist seating, this chair merges organic rattan weave with crisp angular joinery. Lightweight yet extraordinarily durable, it adds texture and warmth to modern interiors.\n\n• Materials: Natural Indonesian rattan cane & solid teak wood\n• Finish: Satin beeswax seal\n• Weight capacity: 300 lbs\n• Fully assembled on arrival.",
      tags: ["rattan", "cane", "midcentury", "teak", "armchair"],
      featured: true,
      recommended: true,
      amazonUrl: "https://www.amazon.com/dp/B07XQXZX9B",
      images: [
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1580481077195-c32e9a5a3a0e?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      id: "prod-terracotta-lamp",
      title: "Artisanal Textured Ceramic Table Lamp with Linen Shade",
      slug: "artisanal-textured-ceramic-table-lamp",
      brand: "Kyoto Atelier",
      categoryId: "cat-lighting",
      shortDescription: "Earth-toned stoneware base with reactive matte glaze and warm neutral natural linen drum shade.",
      description: "Hand-thrown ceramic table lamp that casts a warm, soothing 2700K ambient glow. Each terracotta body exhibits subtle kiln variations, making every lamp uniquely tactile.\n\n• Cord: 6ft braided woven fabric cord with brass inline dimmer\n• Bulb: E26 LED compatible (warm 2700K LED bulb included)\n• Dimensions: 18\"H x 12\" diameter shade.",
      tags: ["lighting", "ceramic", "lamp", "terracotta", "linen"],
      featured: true,
      recommended: true,
      amazonUrl: "https://www.amazon.com/dp/B09YV1R839",
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      id: "prod-brass-sconce",
      title: "Brushed Brass Fluted Glass Ambient Wall Lamp",
      slug: "brushed-brass-fluted-glass-wall-lamp",
      brand: "Kobenhavn Studio",
      categoryId: "cat-lighting",
      shortDescription: "Architectural vertical sconce featuring ribbed borosilicate glass and warm electroplated brass.",
      description: "Designed for bedside reading or atmospheric hallway accents, this sconce diffuses light through architectural fluted glass rods.\n\n• Material: Solid spun brass & ribbed glass\n• Dual installation: Hardwired or plug-in convertible\n• Rating: Damp rated for bathroom vanity use.",
      tags: ["lighting", "brass", "sconce", "glass", "modern"],
      featured: false,
      recommended: true,
      amazonUrl: "https://www.amazon.com/dp/B08HVZ12R9",
      images: [
        "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      id: "prod-sculptural-vase",
      title: "Wabi-Sabi Asymmetric Stone Fluted Ceramic Vessel",
      slug: "wabi-sabi-asymmetric-fluted-vessel",
      brand: "Forma Curated",
      categoryId: "cat-decor",
      shortDescription: "Raw unglazed exterior stoneware with water-sealed interior for fresh or dried botanical arrangements.",
      description: "Celebrates the quiet beauty of intentional asymmetry. Hand-pinched stoneware with coarse mineral grain, designed to stand alone as an art object or showcase sculptural branches.\n\n• Waterproof interior glaze\n• Felt-padded footbed to protect tabletop surfaces\n• Height: 11.5 inches.",
      tags: ["vessel", "vase", "ceramic", "wabisabi", "decor"],
      featured: true,
      recommended: false,
      amazonUrl: "https://www.amazon.com/dp/B07PGF8WQN",
      images: [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      id: "prod-travertine-bookends",
      title: "Solid Italian Beige Travertine Geometric Bookends (Set of 2)",
      slug: "solid-travertine-geometric-bookends",
      brand: "Tuscan Elements",
      categoryId: "cat-decor",
      shortDescription: "Carved from natural unfilled Italian travertine stone with honed matte texture and natural porous veining.",
      description: "Heavyweight architectural bookends crafted from genuine Roman travertine. Each pair weighs over 7 lbs, holding art monographs and hardcovers securely in place.\n\n• Material: 100% natural honed travertine\n• Weight: 7.4 lbs total pair\n• Dimensions per piece: 6\"H x 4\"W x 2.5\"D.",
      tags: ["travertine", "stone", "bookends", "architecture", "decor"],
      featured: false,
      recommended: true,
      amazonUrl: "https://www.amazon.com/dp/B08DD5GQ1L",
      images: [
        "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      id: "prod-linen-throw",
      title: "Stonewashed Pure French Flax Linen Throw Blanket in Oat",
      slug: "stonewashed-french-flax-linen-throw-oat",
      brand: "Brume Living",
      categoryId: "cat-living",
      shortDescription: "Pre-washed for extraordinary softness, featuring delicate eyelash fringe and breathable four-season weight.",
      description: "Woven from 100% certified French flax, this generous throw softens with every wash. Perfect draped over an armchair or across the foot of a bed for an inviting, lived-in luxury feel.\n\n• Composition: 100% certified Normandy flax\n• Care: Machine washable, tumble dry low\n• Size: 50\" x 70\" with 1\" eyelash fringe.",
      tags: ["linen", "throw", "blanket", "textiles", "cozy"],
      featured: true,
      recommended: true,
      amazonUrl: "https://www.amazon.com/dp/B07T29JHLF",
      images: [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      id: "prod-leather-ottoman",
      title: "Full-Grain Cognac Saddle Leather Moroccan Pouf Ottoman",
      slug: "full-grain-cognac-leather-pouf-ottoman",
      brand: "Maison Ritual",
      categoryId: chairId,
      shortDescription: "Hand-stitched genuine vegetable-tanned leather footstool with natural patina and embossed details.",
      description: "Crafted by master leather artisans using traditional vegetable tanning techniques. The rich cognac shade deepens into a lustrous patina over years of use.\n\n• Leather: 100% Full-grain goat leather\n• Pre-stuffed with firm polyfill for lasting shape\n• Diameter: 20\" x 14\" height.",
      tags: ["leather", "pouf", "ottoman", "seating", "cognac"],
      featured: false,
      recommended: true,
      amazonUrl: "https://www.amazon.com/dp/B07D38RJWX",
      images: [
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=80",
      ],
    },
  ];

  for (const item of catalogProducts) {
    const existing = await db.select().from(products).where(eq(products.slug, item.slug));
    let productId = item.id;

    if (existing.length === 0) {
      await db.insert(products).values({
        id: item.id,
        title: item.title,
        slug: item.slug,
        brand: item.brand,
        shortDescription: item.shortDescription,
        description: item.description,
        categoryId: item.categoryId,
        tags: item.tags,
        status: "published",
        featured: item.featured,
        recommended: item.recommended,
        amazonUrl: item.amazonUrl,
        seoTitle: `${item.title} | ZF Store`,
        seoDescription: item.shortDescription,
      });
      console.log(`Inserted product: ${item.title}`);
    } else {
      productId = existing[0].id;
      await db
        .update(products)
        .set({
          title: item.title,
          brand: item.brand,
          shortDescription: item.shortDescription,
          description: item.description,
          categoryId: item.categoryId,
          tags: item.tags,
          status: "published",
          featured: item.featured,
          recommended: item.recommended,
          amazonUrl: item.amazonUrl,
        })
        .where(eq(products.id, productId));
      console.log(`Updated product: ${item.title}`);
    }

    // Insert images
    await db.delete(productImages).where(eq(productImages.productId, productId));
    for (let i = 0; i < item.images.length; i++) {
      await db.insert(productImages).values({
        id: `img-${productId}-${i}`,
        productId: productId,
        url: item.images[i],
        alt: `${item.title} view ${i + 1}`,
        sortOrder: i,
      });
    }
  }

  console.log("Successfully seeded rich boutique catalog!");
  process.exit(0);
}

seedLiveCatalog().catch((err) => {
  console.error("Error seeding live catalog:", err);
  process.exit(1);
});
