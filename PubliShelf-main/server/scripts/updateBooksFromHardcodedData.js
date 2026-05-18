import mongoose from "mongoose";
import Book from "../models/Book.model.js";
import booksData from "./booksData.js"

const GENRES = ["Fiction", "Non-Fiction", "Mystery", "Science Fiction", "Romance", "Thriller", "Other"];
const BUYER_IDS = [
  "681783bfaa232e87a69a5e0e", "681a37cd8a1d9f51042fc800", "681a385f8a1d9f51042fc804",
  "681a3b8829793eecf315fbf2", "681a807c8c31a8c21766aad7", "681ceb9c31e098fc706debe7",
  "6820e960557993721f82ad80", "682473d06e387ef5e6219d21", "682f656e12de8fa3b85e2ff2",
  "686d112d70139d4be620c478", "68acbf0c6c5bd04980fb5fce", "68ba5ee5c98f24011c1c89c1",
  "68ba60528f9c50d9fbf45fe5", "68ba60d0af4aef8a6e1ad3e8", "68ba654fe8232c43ba6e7454",
  "68ea3ac6e32f0b474d01b3a1", "68ea8e52bf66c5f3dfb0abe4", "68ea8e81bf66c5f3dfb0abe8",
  "68ea90089cdd10b778a56b19", "68ea93017a7159c2a8b69120", "68ea93b47a7159c2a8b69126",
  "68eabde2efbbc8a687da5355", "68eabeecefbbc8a687da536d", "68eabefaefbbc8a687da536f",
  "68eabf3befbbc8a687da5371", "68eb98caeca7b68605140d88", "68ebeac417cc791cca6930ea",
  "68ed37d45055580910e785c4", "68f2086f4d246286edd92b04"
];

const DESCRIPTIONS = [
  "A thought-provoking journey into timeless themes.",
  "An engaging and memorable tale filled with wisdom.",
  "A beautifully crafted story with vivid characters.",
  "An insightful look at life's complexities and hopes.",
  "A masterful blend of drama and inspiration.",
  "A captivating narrative of discovery and resilience.",
  "A witty and charming exploration of human nature.",
  "A suspenseful ride full of twists and turns.",
  "A heartwarming adventure that stays with the reader.",
  "A moving testament to the resilience of the spirit."
];

function autoDescription(i, title, author) {
  return `${DESCRIPTIONS[i % DESCRIPTIONS.length]} "${title}" by ${author}.`;
}

function getRandomGenre() {
  return GENRES[Math.floor(Math.random() * GENRES.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomRating() {
  return +(Math.random() * (4.8 - 3.5) + 3.5).toFixed(2);
}

function getReviews(i) {
  const comments = [
    "A must-read! Truly remarkable.",
    "Very enjoyable and well-written.",
    "The story gripped me from start to finish.",
    "Characters feel alive and real.",
    "A book I'll never forget.",
    "Expertly paced and highly recommended.",
    "Loved every chapter!",
    "Unique and engaging storytelling.",
    "Unexpected plot twists kept me hooked."
  ];
  const reviewCount = getRandomInt(1, 3);
  let reviews = [];
  for (let j = 0; j < reviewCount; j++) {
    const buyerId = BUYER_IDS[(i + j) % BUYER_IDS.length];
    reviews.push({
      buyer: new mongoose.Types.ObjectId(buyerId),
      rating: getRandomInt(3, 5),
      comment: comments[(i + j) % comments.length]
    });
  }
  return reviews;
}

const getRandomPrice = () => {
  const min = 199;
  const max = 4999;

  // 1. Get a random "tens" value in the range.
  // (e.g., for 199-4999, the tens range is 19 to 499)
  const minTens = Math.floor(min / 10);
  const maxTens = Math.floor(max / 10);
  
  const randomTens = Math.floor(Math.random() * (maxTens - minTens + 1)) + minTens;

  // 2. Decide on the ending (0, 5, or 9)
  const endingType = Math.random(); // A value from 0.0 to 1.0
  let finalPrice;

  if (endingType < 0.7) { // 70% chance: end in 9
    finalPrice = randomTens * 10 + 9;
  } else if (endingType < 0.9) { // 20% chance: end in 5
    finalPrice = randomTens * 10 + 5;
  } else { // 10% chance: end in 0
    finalPrice = randomTens * 10;
  }

  // 3. Final check to ensure it's in the exact bounds
  if (finalPrice < min) {
    finalPrice = min;
  }
  if (finalPrice > max) {
    finalPrice = max;
  }

  return finalPrice;
};

export async function updateBooksFromHardcodedData() {
  const allBooks = await Book.find({});
  let updatedCount = 0;
  let notUpdatedIndexes = [];

  for (let i = 0; i < allBooks.length && i < booksData.length; i++) {
    const b = booksData[i];
    const updatedFields = {
      title: b.title,
      author: b.author,
      description: b.description && b.description.trim() ? b.description : autoDescription(i, b.title, b.author),
      genre: getRandomGenre(),
      price: getRandomPrice(),
      quantity: getRandomInt(1, 24),
      image: b.image,
      rating: getRandomRating(),
      reviews: getReviews(i),
    };

    try {
      await Book.updateOne({ _id: allBooks[i]._id }, { $set: updatedFields });
      updatedCount++;
      console.log(allBooks[i].title, "->", updatedFields.title)
    } catch (e) {
      notUpdatedIndexes.push(i);
      console.error(`Error updating book index ${i}:`, e);
    }
  }

  console.log(`Total books found and updated: ${updatedCount}`);
  if (notUpdatedIndexes.length) {
    console.log(`Failed to update at indexes: ${notUpdatedIndexes.join(", ")}`);
  }
}