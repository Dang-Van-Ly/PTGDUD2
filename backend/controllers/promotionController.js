import Promotion from "../models/Promotion.js";

export const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPromotionById = async (req, res) => {
  try {
    const promo = await Promotion.findOne({ id: req.params.id });
    if (!promo) return res.status(404).json({ message: "Promotion not found" });
    res.json(promo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
