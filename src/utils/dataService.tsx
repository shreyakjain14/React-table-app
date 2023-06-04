import { Dish } from "../models/Dish";

export async function fetchData(setData: Function) {
  let result: any;
  let flag = true;
  try {
    result = sessionStorage.getItem("dishes");
    result = JSON.parse(result);
  } catch (err) {
    result = [];
  }

  if (!result?.length) {
    flag = false;
    result = await fetch(
      "https://s3-ap-southeast-1.amazonaws.com/he-public-data/reciped9d7b8c.json"
    );
    result = await result.json();
  }

  result.sort((a: Dish, b: Dish): number | boolean => {
    const priceA = Number(a.price);
    const priceB = Number(b.price);
    if (priceA === priceB)
      return a.category.toLowerCase() < b.category.toLowerCase();
    return priceA - priceB;
  });
  if (!flag) sessionStorage.setItem("dishes", result);

  setData(result);
}
