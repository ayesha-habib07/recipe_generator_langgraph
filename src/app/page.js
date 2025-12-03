'use client'
import { useState } from "react";

/**
 * PURPOSE: Main page component for recipe generation
 * 
 * Features:
 * - Form to input recipe details
 * - Displays generated recipe
 * - Handles conflicts with user confirmation
 * - Shows validation errors
 * - Allows regeneration without conflicting ingredients
 */

export default function RecipePage() {
  const [form, setForm] = useState({
    recipeName: "",
    favorites: "",
    allergies: "",
    recipeType: "veg",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/recipe_generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName: form.recipeName,
          favorites: form.favorites
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
          allergies: form.allergies
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
          recipeType: form.recipeType,
        }),
      });

      const data = await res.json();

      if (data.status === "error") {
        setError(data.error || "Failed to generate recipe");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Regenerates recipe without conflicting ingredients
   */
  const handleKeepInAllergy = (conflict) => {
    if (!conflict) return;
    const favoriteToRemove = conflict.favorite.toLowerCase();
    // remove this favorite from favorite list
    const updatedFavoritesArr = result.details.favorites
      .map(f => f.trim())
      .filter(f => f.toLowerCase() !== favoriteToRemove);
    // remove this conflict from favorite list
    const remainingConflicts = result.details.conflicts
      .filter(c => c.favorite.toLowerCase() !== favoriteToRemove);

    // update form
    setForm(prev => ({
      ...prev,
      favorites: updatedFavoritesArr.join(", ")
    }));

    // if no remaining conflicts , close warning 
    if (remainingConflicts.length === 0) {
      setResult(null);
    } else {
      // otherwise update conflicts list
      setResult(prev => ({
        ...prev,
        details: {
          ...prev.details,
          favorites: updatedFavoritesArr,
          conflicts: remainingConflicts
        }
      }));
    }
  };
  const handleKeepInFavorite = (conflict) => {
    if (!conflict) return;
    const allergyToRemove = conflict.allergy.toLowerCase();
    const updatedAllergiesArr = result.details.allergies
      .map(a => a.trim())
      .filter(a => a.toLowerCase() !== allergyToRemove);
    // remove this from allergy list
    const remainingConflicts = result.details.conflicts
      .filter(c => c.allergy.toLowerCase() !== allergyToRemove)
    // update form
    setForm(prev => ({
      ...prev,
      allergies: updatedAllergiesArr.join(", ")
    }));
    // if no remaining conflicts , close warning
    if (remainingConflicts.length === 0) {
      setResult(null)
    } else {
      setResult(prev => ({
        ...prev,
        details: {
          ...prev.details,
          allergies: updatedAllergiesArr,
          conflicts: remainingConflicts
        }
      }));
    }
  }
  return (
    <div className="mx-auto py-10 space-x-6 px-4 flex justify-center">


      {/* ============ FORM ============ */}
      <form className="space-y-4 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Recipe Generator</h1>
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Recipe Name *
          </label>
          <input
            type="text"
            className="text-gray-700 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.recipeName}
            onChange={(e) =>
              setForm({ ...form, recipeName: e.target.value })
            }
            placeholder="e.g. Chicken Biryani"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Favorite Ingredients (comma separated)
          </label>
          <input
            type="text"
            className="text-gray-700 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.favorites}
            onChange={(e) =>
              setForm({ ...form, favorites: e.target.value })
            }
            placeholder="e.g. rice, yogurt, potato"
          />
          <p className="text-sm text-gray-500 mt-1">
            These ingredients will be included in your recipe
          </p>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Allergies (comma separated)
          </label>
          <input
            type="text"
            className="text-gray-700 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.allergies}
            onChange={(e) =>
              setForm({ ...form, allergies: e.target.value })
            }
            placeholder="e.g. peanuts, dairy"
          />
          <p className="text-sm text-gray-500 mt-1">
            These ingredients will be excluded from your recipe
          </p>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Recipe Type *
          </label>
          <select
            className="text-gray-700 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.recipeType}
            onChange={(e) =>
              setForm({ ...form, recipeType: e.target.value })
            }
          >
            <option value="veg">Vegetarian</option>
            <option value="nonVeg">Non-Vegetarian</option>
          </select>
        </div>

        <button
          disabled={loading}
          className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </form>

      {/* ============ ERROR ============ */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ============ CONFLICT WARNING ============ */}
      {result && result.status === "conflict" && (
        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-md">
          <h2 className="text-lg font-bold text-yellow-800 mb-2">
            ⚠️ Ingredient Conflict Detected
          </h2>

          <p className="text-yellow-700 mb-3">{result.message}</p>

          <h3 className="font-semibold text-yellow-800 mb-2">Conflicts:</h3>

          <ul className="space-y-4 ml-2">
            {result.details.conflicts.map((c, i) => (
              <li key={i} className="bg-white p-3 rounded-md border border-yellow-300">
                <p className="text-yellow-800">
                  Favorite <strong>{c.favorite}</strong> conflicts with allergy:{" "}
                  <strong>{c.allergy}</strong>
                </p>

                <div className="flex gap-3 mt-2">
                  {/* Remove FROM FAVORITES, keep in allergies */}
                  <button
                    onClick={() => handleKeepInAllergy(c)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                  >
                    {/* Remove from Favorites */}
                    Keep in Allergies (Remove from Favorites)
                  </button>

                  {/* Remove FROM ALLERGIES, keep in favorites */}
                  <button
                    onClick={() => handleKeepInFavorite(c)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                  >
                    Keep in Favorites (Remove from Allergies)
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* ============ VALIDATION ERRORS ============ */}
      {result && result.status === "validation_error" && (
        <div className="mt-6 p-4 bg-orange-100 border border-orange-300 rounded-md">
          <h2 className="text-lg font-bold text-orange-800 mb-2">
            Validation Failed
          </h2>
          <p className="text-orange-700 mb-3">{result.message}</p>

          <ul className="list-disc ml-6 text-orange-700">
            {result.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ============ SUCCESS - RECIPE CARD ============ */}
      {result && result.status === "success" && result.recipe && (
        <div className="mt-6 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {result.recipe.name}
          </h2>
          <p className="text-sm text-gray-500 capitalize mb-4">
            {result.recipe.recipeType === "veg" ? "🥬 Vegetarian" : "🍖 Non-Vegetarian"}
          </p>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📋 Ingredients
            </h3>
            <ul className="list-disc ml-6 text-gray-700">
              {result.recipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              👨‍🍳 Cooking Steps
            </h3>
            <ol className="list-decimal ml-6 text-gray-700 space-y-2">
              {result.recipe.steps.map((step, idx) => (
                <li key={idx}>
                  {typeof step === "string" ? step : step.instruction}
                </li>

              ))}
            </ol>

          </div>
        </div>
      )}
    </div>
  );
}
