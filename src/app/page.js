// 'use client'
// import { useState } from "react";

// /**
//  * PURPOSE: Main page component for recipe generation
//  * 
//  * Features:
//  * - Form to input recipe details
//  * - Displays generated recipe
//  * - Handles conflicts with user confirmation
//  * - Shows validation errors
//  * - Allows regeneration without conflicting ingredients
//  */

// export default function RecipePage() {
//   const [form, setForm] = useState({
//     recipeName: "",
//     favorites: "",
//     allergies: "",
//     recipeType: "veg",
//   });
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState('');


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");
//     setResult(null);

//     try {
//       const res = await fetch("/api/recipe_generator", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           recipeName: form.recipeName,
//           favorites: form.favorites
//             .split(",")
//             .map((i) => i.trim())
//             .filter(Boolean),
//           allergies: form.allergies
//             .split(",")
//             .map((i) => i.trim())
//             .filter(Boolean),
//           recipeType: form.recipeType,
//         }),
//       });

//       const data = await res.json();

//       if (data.status === "error") {
//         setError(data.error || "Failed to generate recipe");
//         return;
//       }

//       setResult(data);
//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleKeepInAllergy = (conflict) => {
//     if (!conflict) return;
//     const favoriteToRemove = conflict.favorite.toLowerCase();
//     // remove this favorite from favorite list
//     const updatedFavoritesArr = result.details.favorites
//       .map(f => f.trim())
//       .filter(f => f.toLowerCase() !== favoriteToRemove);
//     // remove this conflict from favorite list
//     const remainingConflicts = result.details.conflicts
//       .filter(c => c.favorite.toLowerCase() !== favoriteToRemove);

//     // update form
//     setForm(prev => ({
//       ...prev,
//       favorites: updatedFavoritesArr.join(", ")
//     }));

//     // if no remaining conflicts , close warning 
//     if (remainingConflicts.length === 0) {
//       setResult(null);
//     } else {
//       // otherwise update conflicts list
//       setResult(prev => ({
//         ...prev,
//         details: {
//           ...prev.details,
//           favorites: updatedFavoritesArr,
//           conflicts: remainingConflicts
//         }
//       }));
//     }
//   };
//   const handleKeepInFavorite = (conflict) => {
//     if (!conflict) return;
//     const allergyToRemove = conflict.allergy.toLowerCase();
//     const updatedAllergiesArr = result.details.allergies
//       .map(a => a.trim())
//       .filter(a => a.toLowerCase() !== allergyToRemove);
//     // remove this from allergy list
//     const remainingConflicts = result.details.conflicts
//       .filter(c => c.allergy.toLowerCase() !== allergyToRemove)
//     // update form
//     setForm(prev => ({
//       ...prev,
//       allergies: updatedAllergiesArr.join(", ")
//     }));
//     // if no remaining conflicts , close warning
//     if (remainingConflicts.length === 0) {
//       setResult(null)
//     } else {
//       setResult(prev => ({
//         ...prev,
//         details: {
//           ...prev.details,
//           allergies: updatedAllergiesArr,
//           conflicts: remainingConflicts
//         }
//       }));
//     }
//   }
//   return (
//     <div className="mx-auto py-10 space-x-6 px-4 flex justify-center">


//       {/* ============ FORM ============ */}
//       <form className="space-y-4 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
//         <h1 className="text-3xl font-bold mb-6 text-gray-800">Recipe Generator</h1>
//         <div>
//           <label className="block font-medium text-gray-700 mb-2">
//             Recipe Name *
//           </label>
//           <input
//             type="text"
//             className="text-gray-700 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             value={form.recipeName}
//             onChange={(e) =>
//               setForm({ ...form, recipeName: e.target.value })
//             }
//             placeholder="e.g. Chicken Biryani"
//             required
//           />
//         </div>

//         <div>
//           <label className="block font-medium text-gray-700 mb-2">
//             Favorite Ingredients (comma separated)
//           </label>
//           <input
//             type="text"
//             className="text-gray-700 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             value={form.favorites}
//             onChange={(e) =>
//               setForm({ ...form, favorites: e.target.value })
//             }
//             placeholder="e.g. rice, yogurt, potato"
//           />
//           <p className="text-sm text-gray-500 mt-1">
//             These ingredients will be included in your recipe
//           </p>
//         </div>

//         <div>
//           <label className="block font-medium text-gray-700 mb-2">
//             Allergies (comma separated)
//           </label>
//           <input
//             type="text"
//             className="text-gray-700 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             value={form.allergies}
//             onChange={(e) =>
//               setForm({ ...form, allergies: e.target.value })
//             }
//             placeholder="e.g. peanuts, dairy"
//           />
//           <p className="text-sm text-gray-500 mt-1">
//             These ingredients will be excluded from your recipe
//           </p>
//         </div>

//         <div>
//           <label className="block font-medium text-gray-700 mb-2">
//             Recipe Type *
//           </label>
//           <select
//             className="text-gray-700 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             value={form.recipeType}
//             onChange={(e) =>
//               setForm({ ...form, recipeType: e.target.value })
//             }
//           >
//             <option value="veg">Vegetarian</option>
//             <option value="nonVeg">Non-Vegetarian</option>
//           </select>
//         </div>

//         <button
//           disabled={loading}
//           className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
//         >
//           {loading ? "Generating..." : "Generate Recipe"}
//         </button>
//       </form>

//       {/* ============ ERROR ============ */}
//       {error && (
//         <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
//           <strong>Error:</strong> {error}
//         </div>
//       )}

//       {/* ============ CONFLICT WARNING ============ */}
//       {result && result.status === "conflict" && (
//         <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-md">
//           <h2 className="text-lg font-bold text-yellow-800 mb-2">
//             ⚠️ Ingredient Conflict Detected
//           </h2>

//           <p className="text-yellow-700 mb-3">{result.message}</p>

//           <h3 className="font-semibold text-yellow-800 mb-2">Conflicts:</h3>

//           <ul className="space-y-4 ml-2">
//             {result.details.conflicts.map((c, i) => (
//               <li key={i} className="bg-white p-3 rounded-md border border-yellow-300">
//                 <p className="text-yellow-800">
//                   Favorite <strong>{c.favorite}</strong> conflicts with allergy:{" "}
//                   <strong>{c.allergy}</strong>
//                 </p>

//                 <div className="flex gap-3 mt-2">
//                   {/* Remove FROM FAVORITES, keep in allergies */}
//                   <button
//                     onClick={() => handleKeepInAllergy(c)}
//                     className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
//                   >
//                     {/* Remove from Favorites */}
//                     Keep in Allergies (Remove from Favorites)
//                   </button>

//                   {/* Remove FROM ALLERGIES, keep in favorites */}
//                   <button
//                     onClick={() => handleKeepInFavorite(c)}
//                     className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
//                   >
//                     Keep in Favorites (Remove from Allergies)
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}


//       {/* ============ VALIDATION ERRORS ============ */}
//       {result && result.status === "validation_error" && (
//         <div className="mt-6 p-4 bg-orange-100 border border-orange-300 rounded-md">
//           <h2 className="text-lg font-bold text-orange-800 mb-2">
//             Validation Failed
//           </h2>
//           <p className="text-orange-700 mb-3">{result.message}</p>

//           <ul className="list-disc ml-6 text-orange-700">
//             {result.errors.map((err, i) => (
//               <li key={i}>{err}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* ============ SUCCESS - RECIPE CARD ============ */}
//       {result && result.status === "success" && result.recipe && (
//         <div className="mt-6 bg-white p-6 shadow-lg rounded-lg">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             {result.recipe.name}
//           </h2>
//           <p className="text-sm text-gray-500 capitalize mb-4">
//             {result.recipe.recipeType === "veg" ? "🥬 Vegetarian" : "🍖 Non-Vegetarian"}
//           </p>

//           <div className="mb-4">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               📋 Ingredients
//             </h3>
//             <ul className="list-disc ml-6 text-gray-700">
//               {result.recipe.ingredients.map((ing, idx) => (
//                 <li key={idx}>{ing}</li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               👨‍🍳 Cooking Steps
//             </h3>
//             <ol className="list-decimal ml-6 text-gray-700 space-y-2">
//               {result.recipe.steps.map((step, idx) => (
//                 <li key={idx}>
//                   {typeof step === "string" ? step : step.instruction}
//                 </li>

//               ))}
//             </ol>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// //  using interrupt  
// 'use client'
// import { useState } from "react";

// export default function RecipePage() {
//   const [form, setForm] = useState({
//     recipeName: "",
//     favorites: "",
//     allergies: "",
//     recipeType: "veg",
//   });

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const [interrupt, setInterrupt] = useState(null);
//   const [pendingSelection, setPendingSelection] = useState("");
//   const [threadId, setThreadId] = useState(null);



//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");
//     setResult(null);
//     setInterrupt(null);


//     try {
//       const res = await fetch("/api/recipe_generator", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           recipeName: form.recipeName,
//           favorites: form.favorites.split(",").map(f => f.trim()).filter(Boolean),
//           allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean),
//           recipeType: form.recipeType,
//           threadId: threadId || null,

//         }),
//       });

//       const data = await res.json();
//       if (data.threadId) {
//         setThreadId(data.threadId);
//       }

//       // 🔥 NEW — Handle interrupt
//       if (data.status === "interrupt" && data.__interrupt__) {
//         setInterrupt(data.__interrupt__[0].value.value);
//         setLoading(false);
//         return;
//       }


//       if (data.status === "error") {
//         setError(data.error || "Failed to generate recipe");
//         return;
//       }

//       setResult(data);

//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔥 NEW — resume request
//   const submitResume = async () => {
//     if (!pendingSelection) return;

//     setLoading(true);
//     setResult(null);

//     try {
//       const res = await fetch("/api/recipe_resume", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           selection: pendingSelection,
//           resume: true,
//           recipeName: form.recipeName,
//           favorites: form.favorites.split(",").map(f => f.trim()).filter(Boolean),
//           allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean),
//           recipeType: form.recipeType,
//           threadId: threadId || null,
//         }),
//       });

//       const data = await res.json();


//       if (data.threadId) {
//         setThreadId(data.threadId);
//       }


//       if (data.status === "error") {
//         setError(data.error);
//         return;
//       }

//       setInterrupt(null);
//       setResult(data);

//     } catch (err) {
//       console.error(err);
//       setError("Failed to continue recipe generation");
//     } finally {
//       setLoading(false);
//     }
//   };
//   if (interrupt) {
//     console.log("🚨 INTERRUPT PAYLOAD:", interrupt);
//   }


//   return (
//     <div className="mx-auto py-10 px-4 flex justify-center space-x-6">

//       {/* ============ FORM ============ */}
//       <form className="space-y-4 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
//         <h1 className="text-3xl font-bold mb-6 text-gray-800">Recipe Generator</h1>

//         {/* Inputs... unchanged */}
//         <div>
//           <label className="block font-medium text-gray-700 mb-2">
//             Recipe Name *
//           </label>
//           <input
//             type="text"
//             value={form.recipeName}
//             onChange={(e) => setForm({ ...form, recipeName: e.target.value })}
//             className="text-gray-700 w-full p-3 border rounded-md"
//             required
//           />
//         </div>

//         <div>
//           <label className="block font-medium text-gray-700 mb-2">
//             Favorite Ingredients
//           </label>
//           <input
//             type="text"
//             value={form.favorites}
//             onChange={(e) => setForm({ ...form, favorites: e.target.value })}
//             className="text-gray-700 w-full p-3 border rounded-md"
//           />
//         </div>

//         <div>
//           <label className="block font-medium text-gray-700 mb-2">
//             Allergies
//           </label>
//           <input
//             type="text"
//             value={form.allergies}
//             onChange={(e) => setForm({ ...form, allergies: e.target.value })}
//             className="text-gray-700 w-full p-3 border rounded-md"
//           />
//         </div>

//         <div>
//           <label className="block font-medium text-gray-700 mb-2">
//             Recipe Type *
//           </label>
//           <select
//             value={form.recipeType}
//             onChange={(e) => setForm({ ...form, recipeType: e.target.value })}
//             className="text-gray-700 w-full p-3 border rounded-md"
//           >
//             <option value="veg">Vegetarian</option>
//             <option value="nonVeg">Non-Vegetarian</option>
//           </select>
//         </div>

//         <button
//           disabled={loading}
//           className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-md"
//         >
//           {loading ? "Generating..." : "Generate Recipe"}
//         </button>
//       </form>



//       {/* ===========INterrupt popup for conflict between user favorites and allergies */}

//       {interrupt && interrupt.key === "favorite_vs_allergy_conflict" && (
//         <div className="p-6 bg-red-100 border border-red-300 rounded-md h-fit">
//           <h2 className="text-xl font-bold mb-2 text-red-700">
//             ⚠️ Conflicting Favorite Found
//           </h2>
//           <p className="text-red-600 mb-3">{interrupt.value.message}</p>

//           <ul className="bg-white p-3 rounded-md mb-4">
//             <li key={i} className="mb-1">
//               ❌ Favorite <b>{c.favorite}</b> conflicts with Allergy <b>{c.allergy}</b>
//             </li>
//           </ul>
//           <button className="bg-red-600 text-white px-4 py-2 rounded-md w-full hover:bg-red-700"
//             onClick={() => {
//               const conflictFavorites = interrupt.value.conflicts.map(c => c.favorite);
//               const updatedFavorites = form.favorites
//                 .split(", ")
//                 .map(f => f.trim())
//                 .filter(f => !f.conflictFavorites.includes(f));

//               // update form immedieately
//               setForm({ ...form, favorites: updatedFavorites.join(", ") });


//               // resume node 
//               submitResume({ selection: updatedFavorites });
//             }}
//           >
//             Removing Conflicting Favorites & Continue
//           </button>
//         </div>
//       )}

//       {/* ============ INTERRUPT POPUP (NEW) ============ */}


//       {interrupt && interrupt.key === "allergy_conflict" && (
//         <div className="mt-6 p-6 bg-purple-100 border border-purple-300 rounded-md">
//           <h2 className="text-xl font-bold mb-2 text-purple-900 ">
//             ⚠️ Allergy Found — Select Replacement
//           </h2>

//           <p className="text-purple-700 mb-3">
//             Ingredient <strong>{interrupt.value.allergy}</strong> is not allowed.
//             Select a replacement below:
//           </p>

//           <select
//             className="w-full p-3 border rounded-md text-gray-700"
//             onChange={(e) => setPendingSelection(e.target.value)}
//           >
//             <option value="">Select replacement</option>
//             {interrupt.value.suggestions?.map((s, i) => (
//               <option key={i} value={s}>{s}</option>
//             ))}
//           </select>

//           <button
//             onClick={() => submitResume({ selection: pendingSelection })}
//             disabled={!pendingSelection}
//             className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
//           >
//             Continue with Selection
//           </button>
//         </div>
//       )}

//       {/* Existing conflict, validation, and success UI unchanged */}
//       {error && <div className="mt-6 p-4 bg-red-100">{error}</div>}

//       {result && result.status === "success" && (
//         <div className="mt-6 bg-white p-6 shadow-lg rounded-lg">
//           <h2 className="text-2xl font-bold">{result.recipe.name}</h2>

//           <h3 className="mt-4 text-lg font-semibold">Ingredients</h3>
//           <ul className="list-disc ml-6">
//             {result.recipe.ingredients.map((ing, idx) => (
//               <li key={idx}>{ing}</li>
//             ))}
//           </ul>

//           <h3 className="mt-4 text-lg font-semibold">Steps</h3>
//           <ol className="list-decimal ml-6">
//             {result.recipe.steps.map((s, idx) => (
//               <li key={idx}>{s}</li>
//             ))}
//           </ol>
//         </div>
//       )}
//     </div>
//   );
// }










// 'use client'
// import { useState } from "react";

// export default function RecipePage() {
//   const [form, setForm] = useState({
//     recipeName: "",
//     favorites: "",
//     allergies: "",
//     recipeType: "veg",
//   });

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const [interruptData, setInterruptData] = useState(null);
//   const [pendingSelection, setPendingSelection] = useState("");
//   const [threadId, setThreadId] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");
//     setResult(null);
//     setInterruptData(null);

//     try {
//       const res = await fetch("/api/recipe_generator", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           recipeName: form.recipeName,
//           favorites: form.favorites.split(",").map(f => f.trim()).filter(Boolean),
//           allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean),
//           recipeType: form.recipeType,
//           threadId: threadId || null,
//         }),
//       });

//       const data = await res.json();
//       console.log("📥 Response:", data);

//       if (data.threadId) {
//         setThreadId(data.threadId);
//       }

//       // Handle interrupt
//       if (data.status === "interrupt") {
//         setInterruptData(data.interruptData);
//         setLoading(false);
//         return;
//       }

//       if (data.status === "error") {
//         setError(data.error || "Failed to generate recipe");
//         return;
//       }

//       if (data.status === "validation_error") {
//         setError(data.message + ": " + data.errors.map(e => e.message).join(", "));
//         return;
//       }

//       setResult(data);

//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitResume = async () => {
//     if (!pendingSelection) {
//       alert("Please select a replacement");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/recipe_resume", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           selection: pendingSelection,
//           recipeName: form.recipeName,
//           favorites: form.favorites.split(",").map(f => f.trim()).filter(Boolean),
//           allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean),
//           recipeType: form.recipeType,
//           threadId,
//         }),
//       });

//       const data = await res.json();
//       console.log("📥 Resume Response:", data);

//       if (data.threadId) {
//         setThreadId(data.threadId);
//       }

//       if (data.status === "interrupt") {
//         setInterruptData(data.interruptData);
//         setPendingSelection("");
//         setLoading(false);
//         return;
//       }

//       if (data.status === "error") {
//         setError(data.error);
//         return;
//       }

//       if (data.status === "validation_error") {
//         setError(data.message + ": " + data.errors.map(e => e.message).join(", "));
//         return;
//       }

//       setInterruptData(null);
//       setPendingSelection("");
//       setResult(data);

//     } catch (err) {
//       console.error(err);
//       setError("Failed to continue recipe generation");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveConflicts = () => {
//     if (!interruptData?.conflicts) return;

//     const conflictFavorites = interruptData.conflicts.map(c => c.favorite.toLowerCase());
//     const updatedFavorites = form.favorites
//       .split(",")
//       .map(f => f.trim())
//       .filter(f => !conflictFavorites.includes(f.toLowerCase()))
//       .join(", ");

//     setForm({ ...form, favorites: updatedFavorites });
//     setInterruptData(null);

//     // Resubmit
//     setTimeout(() => {
//       document.querySelector('form').requestSubmit();
//     }, 100);
//   };




//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-6xl mx-auto flex gap-6">

//         {/* FORM */}
//         <form className="flex-1 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
//           <h1 className="text-3xl font-bold mb-6 text-gray-800">🍳 Recipe Generator</h1>

//           <div className="space-y-4">
//             <div>
//               <label className="block font-medium text-gray-700 mb-2">
//                 Recipe Name *
//               </label>
//               <input
//                 type="text"
//                 value={form.recipeName}
//                 onChange={(e) => setForm({ ...form, recipeName: e.target.value })}
//                 className="text-gray-700 w-full p-3 border rounded-md"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-2">
//                 Favorite Ingredients (comma-separated)
//               </label>
//               <input
//                 type="text"
//                 value={form.favorites}
//                 onChange={(e) => setForm({ ...form, favorites: e.target.value })}
//                 className="text-gray-700 w-full p-3 border rounded-md"
//                 placeholder="e.g. tomatoes, cheese, basil"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-2">
//                 Allergies (comma-separated)
//               </label>
//               <input
//                 type="text"
//                 value={form.allergies}
//                 onChange={(e) => setForm({ ...form, allergies: e.target.value })}
//                 className="text-gray-700 w-full p-3 border rounded-md"
//                 placeholder="e.g. nuts, dairy, gluten"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-2">
//                 Recipe Type *
//               </label>
//               <select
//                 value={form.recipeType}
//                 onChange={(e) => setForm({ ...form, recipeType: e.target.value })}
//                 className="text-gray-700 w-full p-3 border rounded-md"
//               >
//                 <option value="veg">Vegetarian</option>
//                 <option value="nonVeg">Non-Vegetarian</option>
//               </select>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-md disabled:opacity-50"
//             >
//               {loading ? "Generating..." : "Generate Recipe"}
//             </button>
//           </div>
//         </form>

//         {/* INTERRUPT POPUPS */}
//         <div className="flex-1">
//           {/* Favorite vs Allergy Conflict */}
//           {interruptData && interruptData.key === "favorite_vs_allergy_conflict" && (
//             <div className="p-6 bg-red-100 border border-red-300 rounded-md">
//               <h2 className="text-xl font-bold mb-2 text-red-700">
//                 ⚠️ Conflicting Favorites Found
//               </h2>
//               <p className="text-red-600 mb-3">{interruptData.message}</p>

//               <ul className="bg-white p-3 rounded-md mb-4 space-y-1">
//                 {interruptData.conflicts?.map((c, i) => (
//                   <li key={i} className="text-gray-700">
//                     ❌ Favorite <strong>{c.favorite}</strong> conflicts with allergy <strong>{c.allergy}</strong>
//                   </li>
//                 ))}
//               </ul>

//               <button
//                 className="bg-red-600 text-white px-4 py-2 rounded-md w-full hover:bg-red-700"
//                 onClick={handleRemoveConflicts}
//               >
//                 Remove Conflicting Favorites & Continue
//               </button>
//             </div>
//           )}

//           {/* Allergy Conflict (LLM Suggestions) */}
//           {interruptData && interruptData.key === "allergy_conflict" && (
//             <div className="p-6 bg-purple-100 border border-purple-300 rounded-md">
//               <h2 className="text-xl font-bold mb-2 text-purple-900">
//                 ⚠️ Allergy Found — Select Replacement
//               </h2>

//               <p className="text-purple-700 mb-3">
//                 Ingredient <strong>{interruptData.allergy}</strong> is not allowed.
//                 Please select a safe replacement:
//               </p>

//               <select
//                 className="w-full p-3 border rounded-md text-gray-700 mb-4"
//                 value={pendingSelection}
//                 onChange={(e) => setPendingSelection(e.target.value)}
//               >
//                 <option value="">-- Select replacement --</option>
//                 {interruptData.suggestions?.map((s, i) => (
//                   <option key={i} value={s}>{s}</option>
//                 ))}
//               </select>

//               <button
//                 onClick={submitResume}
//                 disabled={!pendingSelection || loading}
//                 className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
//               >
//                 {loading ? "Processing..." : "Continue with Selection"}
//               </button>
//             </div>
//           )}

//           {/* Error Display */}
//           {error && (
//             <div className="p-4 bg-red-100 border border-red-300 rounded-md text-red-700">
//               <strong>Error:</strong> {error}
//             </div>
//           )}

//           {/* Success Display */}
//           {result && result.status === "success" && (
//             <div className="bg-white p-6 shadow-lg rounded-lg">
//               <h2 className="text-2xl font-bold text-green-700 mb-4">
//                 ✅ {result.recipe.name}
//               </h2>

//               <h3 className="text-lg font-semibold mt-4 mb-2">Ingredients</h3>
//               <ul className="list-disc ml-6 space-y-1 text-gray-700">
//                 {result.recipe.ingredients?.map((ing, idx) => (
//                   <li key={idx}>{ing}</li>
//                 ))}
//               </ul>

//               <h3 className="text-lg font-semibold mt-4 mb-2">Steps</h3>
//               <ol className="list-decimal ml-6 space-y-2 text-gray-700">
//                 {result.recipe.steps?.map((s, idx) => (
//                   <li key={idx}>{s}</li>
//                 ))}
//               </ol>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




















// // new UI   working   
// 'use client'
// import { useState } from "react";

// export default function RecipePage() {
//   const [form, setForm] = useState({
//     recipeName: "",
//     favorites: "",
//     allergies: "",
//     recipeType: "veg",
//   });

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const [interruptData, setInterruptData] = useState(null);
//   const [pendingSelection, setPendingSelection] = useState("");
//   const [threadId, setThreadId] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");
//     setResult(null);
//     setInterruptData(null);

//     try {
//       const res = await fetch("/api/recipe_generator", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           recipeName: form.recipeName,
//           favorites: form.favorites.split(",").map(f => f.trim()).filter(Boolean),
//           allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean),
//           recipeType: form.recipeType,
//           threadId: threadId || null,
//         }),
//       });

//       const data = await res.json();
//       console.log("---------------------------📥 Response:-----------------------", data);

//       if (data.threadId) {
//         setThreadId(data.threadId);
//       }

//       // Handle interrupt
//       if (data.status === "interrupt") {
//         setInterruptData(data.interruptData);
//         setLoading(false);
//         return;
//       }

//       if (data.status === "error") {
//         setError(data.error || "Failed to generate recipe");
//         setLoading(false);
//         return;
//       }

//       if (data.status === "validation_error") {
//         setError(data.message + ": " + (data.errors?.map(e => e.message).join(", ") || "Unknown error"));
//         setLoading(false);
//         return;
//       }

//       // Success
//       setResult(data);

//     } catch (err) {
//       console.error("---------------------------❌ Frontend error:-------------------", err);
//       setError("-----------------Something went wrong in handleSubmit page.js. Please try again.-------------------");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitResume = async () => {
//     if (!pendingSelection) {
//       alert("Please select a replacement");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/recipe_resume", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           selection: pendingSelection,
//           recipeName: form.recipeName,
//           favorites: form.favorites.split(",").map(f => f.trim()).filter(Boolean),
//           allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean),
//           recipeType: form.recipeType,
//           threadId,
//         }),
//       });

//       const data = await res.json();
//       console.log("-----------------------📥 Resume Response:------------------------", data);

//       if (data.threadId) {
//         setThreadId(data.threadId);
//       }

//       if (data.status === "interrupt") {
//         setInterruptData(data.interruptData);
//         setPendingSelection("");
//         setLoading(false);
//         return;
//       }

//       if (data.status === "error") {
//         setError(data.error);
//         setLoading(false);
//         return;
//       }

//       if (data.status === "validation_error") {
//         setError(data.message + ": " + (data.errors?.map(e => e.message).join(", ") || "Unknown error"));
//         setLoading(false);
//         return;
//       }

//       setInterruptData(null);
//       setPendingSelection("");
//       setResult(data);

//     } catch (err) {
//       console.error("❌ Resume error:", err);
//       setError("Failed to continue recipe generation");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleRemoveConflicts = () => {
//   //   if (!interruptData?.conflicts) return;

//   //   const conflictFavorites = interruptData.conflicts.map(c => c.favorite.toLowerCase());
//   //   const updatedFavorites = form.favorites
//   //     .split(",")
//   //     .map(f => f.trim())
//   //     .filter(f => !conflictFavorites.includes(f.toLowerCase()))
//   //     .join(", ");

//   //   setForm({ ...form, favorites: updatedFavorites });
//   //   setInterruptData(null);

//   //   // Resubmit
//   //   setTimeout(() => {
//   //     const formElement = document.querySelector('form');
//   //     if (formElement) {
//   //       formElement.requestSubmit();
//   //     }
//   //   }, 100);
//   // };

//   // remove from favorite and keep in allergy
//   const handleKeepInAllergy = (conflict) => {
//     if (!conflict) return;
//     const favoriteToRemove = conflict.favorite.toLowerCase();
//     const updatedFavoriteArray = form.favorites
//       .split(", ")
//       .map(f => f.trim())
//       .filter(f => f.toLowerCase() !== favoriteToRemove);

//     const remainingConflicts = interruptData.conflicts
//       .filter(c => c.favorite.toLowerCase() !== favoriteToRemove);

//     // updated form
//     setForm(prev => ({
//       ...prev,
//       favorites: updatedFavoriteArray.join(", ")
//     }));
//     // close popup if no remaining popup
//     if (remainingConflicts.length === 0) {
//       setInterruptData(null);
//       // automatically resubmit
//       setTimeout(() => {
//         const formElement = document.querySelector("form");
//         if (formElement) formElement.requestSubmit();
//       }, 100);
//     } else {
//       setInterruptData(prev => ({
//         ...prev,
//         conflicts: remainingConflicts,
//       }));
//     }
//   };

//   // remove from allergy(keep in favorite)

//   const handleKeepInFavorite = (conflict) => {
//     if (!conflict) return;

//     const allergyToRemove = conflict.allergy.toLowerCase();

//     const updatedAllergiesArray = form.allergies
//       .split(", ")
//       .map(a => a.trim())
//       .filter(c => c.toLowerCase() !== allergyToRemove)

//     const remainingConflicts = interruptData.conflicts
//       .filter(c => c.allergy.toLowerCase() !== allergyToRemove);


//     // update form
//     setForm(prev => ({
//       ...prev,
//       allergies: updatedAllergiesArray.join(", ")
//     }));


//     // close popup if no conflicts
//     if (remainingConflicts.length === 0) {
//       setInterruptData(null)

//       // automatically resubmit
//       setTimeout(() => {
//         const formElement = document.querySelector("form");
//         if (formElement) formElement.requestSubmit();
//       }, 100);
//     } else {
//       setInterruptData(prev => ({
//         ...prev,
//         conflicts: remainingConflicts,
//       }));
//     }
//   };

//   return (
//     // <div className="min-h-screen bg-gray-50 py-10 px-4">
//     //   <div className="max-w-6xl mx-auto flex gap-6">

//     //     {/* FORM */}
//     //     <form className="flex-1 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
//     //       <h1 className="text-3xl font-bold mb-6 text-gray-800">🍳 Recipe Generator</h1>

//     //       <div className="space-y-4">
//     //         <div>
//     //           <label className="block font-medium text-gray-700 mb-2">
//     //             Recipe Name *
//     //           </label>
//     //           <input
//     //             type="text"
//     //             value={form.recipeName}
//     //             onChange={(e) => setForm({ ...form, recipeName: e.target.value })}
//     //             className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
//     //             placeholder="e.g. Pasta, Pizza, Salad"
//     //             required
//     //           />
//     //         </div>

//     //         <div>
//     //           <label className="block font-medium text-gray-700 mb-2">
//     //             Favorite Ingredients (comma-separated)
//     //           </label>
//     //           <input
//     //             type="text"
//     //             value={form.favorites}
//     //             onChange={(e) => setForm({ ...form, favorites: e.target.value })}
//     //             className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
//     //             placeholder="e.g. tomatoes, cheese, basil"
//     //           />
//     //         </div>

//     //         <div>
//     //           <label className="block font-medium text-gray-700 mb-2">
//     //             Allergies (comma-separated)
//     //           </label>
//     //           <input
//     //             type="text"
//     //             value={form.allergies}
//     //             onChange={(e) => setForm({ ...form, allergies: e.target.value })}
//     //             className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
//     //             placeholder="e.g. nuts, dairy, gluten"
//     //           />
//     //         </div>

//     //         <div>
//     //           <label className="block font-medium text-gray-700 mb-2">
//     //             Recipe Type *
//     //           </label>
//     //           <select
//     //             value={form.recipeType}
//     //             onChange={(e) => setForm({ ...form, recipeType: e.target.value })}
//     //             className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
//     //           >
//     //             <option value="veg">Vegetarian</option>
//     //             <option value="nonVeg">Non-Vegetarian</option>
//     //           </select>
//     //         </div>

//     //         <button
//     //           type="submit"
//     //           disabled={loading}
//     //           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//     //         >
//     //           {loading ? "⏳ Generating..." : "🚀 Generate Recipe"}
//     //         </button>
//     //       </div>
//     //     </form>

//     //     {/* RIGHT PANEL - INTERRUPTS & RESULTS */}
//     //     <div className="flex-1 space-y-4">
//     //       {/* Favorite vs Allergy Conflict */}
//     //       {interruptData && interruptData.key === "favorite_vs_allergy_conflict" && (
//     //         <div className="p-6 bg-red-100 border-2 border-red-300 rounded-lg shadow-md">
//     //           <h2 className="text-xl font-bold mb-2 text-red-700">
//     //             ⚠️ Conflicting Favorites Found
//     //           </h2>
//     //           <p className="text-red-600 mb-3">{interruptData.message}</p>

//     //           <ul className="bg-white p-4 rounded-md mb-4 space-y-2">
//     //             {interruptData.conflicts?.map((c, i) => (
//     //               <li key={i} className="text-gray-700 flex items-center gap-2">
//     //                 <span className="text-red-500">❌</span>
//     //                 Favorite <strong className="text-red-700">{c.favorite}</strong> conflicts with allergy <strong className="text-red-700">{c.allergy}</strong>
//     //               </li>
//     //             ))}

//     //           </ul>

//     //           {/* <button
//     //             className="bg-red-600 text-white px-4 py-2 rounded-md w-full hover:bg-red-700 transition-colors font-semibold"
//     //             onClick={handleRemoveConflicts}
//     //           >
//     //             Remove Conflicting Favorites & Continue
//     //           </button> */}
//     //           <div className="flex gap-3 mt-3">
//     //             {/* REMOVE from favorite */}
//     //             <button
//     //               className="bg-orange-600 text-white px-3 py-2 rounded-md flex-1 hover:bg-orange-700"
//     //               onClick={() => handleKeepInAllergy(c)}
//     //             >
//     //               Remove from Favorites
//     //             </button>

//     //             {/* REMOVE from allergy */}
//     //             <button
//     //               className="bg-blue-600 text-white px-3 py-2 rounded-md flex-1 hover:bg-blue-700"
//     //               onClick={() => handleKeepInFavorite(c)}
//     //             >
//     //               Remove from Allergies
//     //             </button>
//     //           </div>


//     //         </div>
//     //       )}

//     //       {/* Allergy Conflict (LLM Suggestions) */}
//     //       {interruptData && interruptData.key === "allergy_conflict" && (
//     //         <div className="p-6 bg-purple-100 border-2 border-purple-300 rounded-lg shadow-md">
//     //           <h2 className="text-xl font-bold mb-2 text-purple-900">
//     //             ⚠️ Allergy Found — Select Replacement
//     //           </h2>

//     //           <p className="text-purple-700 mb-3">
//     //             Ingredient <strong className="text-purple-900">{interruptData.allergy}</strong> is not allowed.
//     //             Please select a safe replacement:
//     //           </p>

//     //           <select
//     //             className="w-full p-3 border-2 border-purple-300 rounded-md text-gray-700 mb-4 focus:ring-2 focus:ring-purple-500"
//     //             value={pendingSelection}
//     //             onChange={(e) => setPendingSelection(e.target.value)}
//     //           >
//     //             <option value="">-- Select replacement --</option>
//     //             {interruptData.suggestions?.map((s, i) => (
//     //               <option key={i} value={s}>{s}</option>
//     //             ))}
//     //           </select>

//     //           <button
//     //             onClick={submitResume}
//     //             disabled={!pendingSelection || loading}
//     //             className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
//     //           >
//     //             {loading ? "⏳ Processing..." : "✅ Continue with Selection"}
//     //           </button>
//     //         </div>
//     //       )}

//     //       {/* Error Display */}
//     //       {error && (
//     //         <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg text-red-700">
//     //           <div className="flex items-start gap-2">
//     //             <span className="text-xl">❌</span>
//     //             <div>
//     //               <strong className="block mb-1">Error:</strong>
//     //               <p>{error}</p>
//     //             </div>
//     //           </div>
//     //         </div>
//     //       )}

//     //       {/* Success Display - WITH NULL CHECKS */}
//     //       {result && result.status === "success" && result.recipe && (
//     //         <div className="bg-white p-6 shadow-lg rounded-lg border-2 border-green-200">
//     //           <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
//     //             <span>✅</span>
//     //             <span>{result.recipe.name || "Untitled Recipe"}</span>
//     //           </h2>

//     //           {/* Ingredients Section */}
//     //           {result.recipe.ingredients && result.recipe.ingredients.length > 0 && (
//     //             <>
//     //               <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
//     //                 📝 Ingredients
//     //               </h3>
//     //               <ul className="list-disc ml-6 space-y-1 text-gray-700 bg-gray-50 p-4 rounded-md">
//     //                 {result.recipe.ingredients.map((ing, idx) => (
//     //                   <li key={idx}>{ing}</li>
//     //                 ))}
//     //               </ul>
//     //             </>
//     //           )}

//     //           {/* Steps Section */}
//     //           {result.recipe.steps && result.recipe.steps.length > 0 && (
//     //             <>
//     //               <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800">
//     //                 👨‍🍳 Steps
//     //               </h3>
//     //               <ol className="list-decimal ml-6 space-y-2 text-gray-700 bg-gray-50 p-4 rounded-md">
//     //                 {result.recipe.steps.map((s, idx) => (
//     //                   <li key={idx} className="leading-relaxed">{s}</li>
//     //                 ))}
//     //               </ol>
//     //             </>
//     //           )}

//     //           {/* No recipe data */}
//     //           {(!result.recipe.ingredients || result.recipe.ingredients.length === 0) &&
//     //             (!result.recipe.steps || result.recipe.steps.length === 0) && (
//     //               <p className="text-yellow-600 bg-yellow-50 p-4 rounded-md">
//     //                 ⚠️ Recipe generated but missing details. Please try again.
//     //               </p>
//     //             )}
//     //         </div>
//     //       )}

//     //       {/* Loading State */}
//     //       {loading && !interruptData && (
//     //         <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 text-center">
//     //           <div className="animate-spin text-4xl mb-2">🔄</div>
//     //           <p className="text-blue-700 font-semibold">Generating your recipe...</p>
//     //         </div>
//     //       )}
//     //     </div>
//     //   </div>
//     // </div>
//     <div className="min-h-screen bg-gray-50 py-10 px-4">
//       <div className="max-w-6xl mx-auto flex gap-6">

//         {/* FORM */}
//         <form className="flex-1 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
//           <h1 className="text-3xl font-bold mb-6 text-gray-800">🍳 Recipe Generator</h1>

//           <div className="space-y-4">
//             <div>
//               <label className="block font-medium text-gray-700 mb-2">
//                 Recipe Name *
//               </label>
//               <input
//                 type="text"
//                 value={form.recipeName}
//                 onChange={(e) => setForm({ ...form, recipeName: e.target.value })}
//                 className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 placeholder="e.g. Pasta, Pizza, Salad"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-2">
//                 Favorite Ingredients (comma-separated)
//               </label>
//               <input
//                 type="text"
//                 value={form.favorites}
//                 onChange={(e) => setForm({ ...form, favorites: e.target.value })}
//                 className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 placeholder="e.g. tomatoes, cheese, basil"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-2">
//                 Allergies (comma-separated)
//               </label>
//               <input
//                 type="text"
//                 value={form.allergies}
//                 onChange={(e) => setForm({ ...form, allergies: e.target.value })}
//                 className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 placeholder="e.g. nuts, dairy, gluten"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-2">
//                 Recipe Type *
//               </label>
//               <select
//                 value={form.recipeType}
//                 onChange={(e) => setForm({ ...form, recipeType: e.target.value })}
//                 className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="veg">Vegetarian</option>
//                 <option value="nonVeg">Non-Vegetarian</option>
//               </select>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? "⏳ Generating..." : "🚀 Generate Recipe"}
//             </button>
//           </div>
//         </form>

//         {/* RIGHT PANEL - INTERRUPTS & RESULTS */}
//         <div className="flex-1 space-y-4">
//           {/* Favorite vs Allergy Conflict - FIXED */}
//           {interruptData && interruptData.key === "favorite_vs_allergy_conflict" && (
//             <div className="p-6 bg-red-100 border-2 border-red-300 rounded-lg shadow-md">
//               <h2 className="text-xl font-bold mb-2 text-red-700">
//                 ⚠️ Conflicting Favorites Found
//               </h2>
//               <p className="text-red-600 mb-3">{interruptData.message}</p>

//               <div className="space-y-3">
//                 {interruptData.conflicts?.map((c, i) => (
//                   <div key={i} className="bg-white p-4 rounded-md border border-red-200">
//                     <div className="flex items-center gap-2 mb-3">
//                       <span className="text-red-500 text-xl">❌</span>
//                       <p className="text-gray-700">
//                         Favorite <strong className="text-red-700">{c.favorite}</strong> conflicts with allergy <strong className="text-red-700">{c.allergy}</strong>
//                       </p>
//                     </div>

//                     <div className="flex gap-3">
//                       {/* Remove from favorites */}
//                       <button
//                         className="bg-orange-600 text-white px-3 py-2 rounded-md flex-1 hover:bg-orange-700 transition-colors text-sm font-medium"
//                         onClick={() => handleKeepInAllergy(c)}
//                       >
//                         Remove from Favorites
//                       </button>

//                       {/* Remove from allergies */}
//                       <button
//                         className="bg-blue-600 text-white px-3 py-2 rounded-md flex-1 hover:bg-blue-700 transition-colors text-sm font-medium"
//                         onClick={() => handleKeepInFavorite(c)}
//                       >
//                         Remove from Allergies
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <p className="text-sm text-gray-600 mt-4 text-center">
//                 💡 Resolve each conflict by choosing which list to keep the ingredient in
//               </p>
//             </div>
//           )}

//           {/* Allergy Conflict (LLM Suggestions) */}
//           {interruptData && interruptData.key === "allergy_conflict" && (
//             <div className="p-6 bg-purple-100 border-2 border-purple-300 rounded-lg shadow-md">
//               <h2 className="text-xl font-bold mb-2 text-purple-900">
//                 ⚠️ Allergy Found — Select Replacement
//               </h2>

//               <p className="text-purple-700 mb-3">
//                 Ingredient <strong className="text-purple-900">{interruptData.allergy}</strong> is not allowed.
//                 Please select a safe replacement:
//               </p>

//               <select
//                 className="w-full p-3 border-2 border-purple-300 rounded-md text-gray-700 mb-4 focus:ring-2 focus:ring-purple-500"
//                 value={pendingSelection}
//                 onChange={(e) => setPendingSelection(e.target.value)}
//               >
//                 <option value="">-- Select replacement --</option>
//                 {interruptData.suggestions?.map((s, i) => (
//                   <option key={i} value={s}>{s}</option>
//                 ))}
//               </select>

//               <button
//                 onClick={submitResume}
//                 disabled={!pendingSelection || loading}
//                 className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
//               >
//                 {loading ? "⏳ Processing..." : "✅ Continue with Selection"}
//               </button>
//             </div>
//           )}

//           {/* Error Display */}
//           {error && (
//             <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg text-red-700">
//               <div className="flex items-start gap-2">
//                 <span className="text-xl">❌</span>
//                 <div>
//                   <strong className="block mb-1">Error:</strong>
//                   <p>{error}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Allergy Information (not a conflict, just helpful info) */}
//           {interruptData && interruptData.key === "allergy_info" && (
//             <div className="p-6 bg-blue-100 border-2 border-blue-300 rounded-lg shadow-md">
//               <h2 className="text-xl font-bold mb-2 text-blue-900">
//                 ℹ️ Allergy Alternatives
//               </h2>
//               <p className="text-blue-700 mb-4">{interruptData.message}</p>

//               <div className="space-y-3 mb-4">
//                 {interruptData.allergyAlternatives?.map((item, i) => (
//                   <div key={i} className="bg-white p-4 rounded-md">
//                     <p className="font-semibold text-gray-800 mb-2">
//                       🚫 {item.allergy}
//                     </p>
//                     <p className="text-sm text-gray-600 mb-2">Safe alternatives:</p>
//                     <ul className="list-disc ml-6 text-sm text-gray-700">
//                       {item.alternatives.map((alt, j) => (
//                         <li key={j}>{alt}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={() => {
//                   setInterruptData(null);
//                   // Continue to recipe generation
//                   setTimeout(() => {
//                     const formElement = document.querySelector("form");
//                     if (formElement) formElement.requestSubmit();
//                   }, 100);
//                 }}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-semibold"
//               >
//                 ✅ Got it, Continue
//               </button>
//             </div>
//           )}

//           {/* Success Display - WITH NULL CHECKS */}
//           {result && result.status === "success" && result.recipe && (
//             <div className="bg-white p-6 shadow-lg rounded-lg border-2 border-green-200">
//               <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
//                 <span>✅</span>
//                 <span>{result.recipe.name || "Untitled Recipe"}</span>
//               </h2>

//               {/* Ingredients Section */}
//               {result.recipe.ingredients && result.recipe.ingredients.length > 0 && (
//                 <>
//                   <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
//                     📝 Ingredients
//                   </h3>
//                   <ul className="list-disc ml-6 space-y-1 text-gray-700 bg-gray-50 p-4 rounded-md">
//                     {result.recipe.ingredients.map((ing, idx) => (
//                       <li key={idx}>{ing}</li>
//                     ))}
//                   </ul>
//                 </>
//               )}

//               {/* Steps Section */}
//               {result.recipe.steps && result.recipe.steps.length > 0 && (
//                 <>
//                   <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800">
//                     👨‍🍳 Steps
//                   </h3>
//                   <ol className="list-decimal ml-6 space-y-2 text-gray-700 bg-gray-50 p-4 rounded-md">
//                     {result.recipe.steps.map((s, idx) => (
//                       <li key={idx} className="leading-relaxed">{s}</li>
//                     ))}
//                   </ol>
//                 </>
//               )}

//               {/* No recipe data */}
//               {(!result.recipe.ingredients || result.recipe.ingredients.length === 0) &&
//                 (!result.recipe.steps || result.recipe.steps.length === 0) && (
//                   <p className="text-yellow-600 bg-yellow-50 p-4 rounded-md">
//                     ⚠️ Recipe generated but missing details. Please try again.
//                   </p>
//                 )}
//             </div>
//           )}

//           {/* Loading State */}
//           {loading && !interruptData && (
//             <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 text-center">
//               <div className="animate-spin text-4xl mb-2">🔄</div>
//               <p className="text-blue-700 font-semibold">Generating your recipe...</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }





// ## **Key Changes:**

// 1. **Fixed JSX structure**: Each conflict now has its own container with buttons inside the map
// 2. **Better layout**: Each conflict is shown in a separate card with its own action buttons
// 3. **One-by-one resolution**: User can resolve conflicts individually
// 4. **Visual feedback**: Counter at bottom shows progress through conflicts
// 5. **Auto-resubmit**: After all conflicts are resolved, form automatically resubmits

// ---

// ## **How It Works Now:**

// 1. **Multiple Conflicts**: Each conflict gets its own card with two buttons
// 2. **Choose Action**: User clicks either "Remove from Favorites" or "Remove from Allergies"
// 3. **Update State**: The conflict is resolved and removed from the list
// 4. **Remaining Conflicts**: Other conflicts stay visible until resolved
// 5. **Auto-continue**: When all conflicts are resolved, form automatically resubmits

// ---

// ## **Example Flow:**

// Input:
// - Favorites: `cheese, mushrooms, garlic, basil`
// - Allergies: `cheese, garlic, tomatoes`

// Result: Two conflict cards appear:
// ```
// ┌─────────────────────────────────────┐
// │ ❌ Favorite cheese conflicts with   │
// │    allergy cheese                   │
// │                                     │
// │ [Remove from Favorites] [Remove...] │
// └─────────────────────────────────────┘

// ┌─────────────────────────────────────┐
// │ ❌ Favorite garlic conflicts with   │
// │    allergy garlic                   │
// │                                     │
// │ [Remove from Favorites] [Remove...] │
// └─────────────────────────────────────┘
// User resolves both, then form auto-resubmits with updated values! 🎉Claude is AI and can make mistakes. Please double-check responses.


















'use client'
import { useState } from "react";

export default function RecipePage() {
  const [form, setForm] = useState({
    recipeName: "",
    favorites: "",
    allergies: "",
    recipeType: "veg",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [interruptData, setInterruptData] = useState(null);
  const [pendingSelection, setPendingSelection] = useState("");
  const [threadId, setThreadId] = useState(null);
  // Track selected alternatives for each allergy
  const [selectedAlternatives, setSelectedAlternatives] = useState({});
  // track selected veg replacements
  const [selectedVegReplacements, setSelectedVegReplacements] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setInterruptData(null);
    setSelectedAlternatives({});

    try {
      const res = await fetch("/api/recipe_generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName: form.recipeName,
          favorites: form.favorites.split(",").map(f => f.trim()).filter(Boolean),
          allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean),
          recipeType: form.recipeType,
          threadId: threadId || null,
        }),
      });

      const data = await res.json();
      console.log("📥 Response:", data);

      if (data.threadId) {
        setThreadId(data.threadId);
      }

      if (data.status === "interrupt") {
        setInterruptData(data.interruptData);
        setLoading(false);
        return;
      }

      if (data.status === "error") {
        setError(data.error || "Failed to generate recipe");
        setLoading(false);
        return;
      }

      if (data.status === "validation_error") {
        setError(data.message + ": " + (data.errors?.map(e => e.message).join(", ") || "Unknown error"));
        setLoading(false);
        return;
      }

      setResult(data);

    } catch (err) {
      console.error("❌ Frontend error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitResume = async () => {
    if (!pendingSelection) {
      alert("Please select a replacement");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/recipe_resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selection: pendingSelection,
          recipeName: form.recipeName,
          favorites: form.favorites.split(",").map(f => f.trim()).filter(Boolean),
          allergies: form.allergies.split(",").map(a => a.trim()).filter(Boolean),
          recipeType: form.recipeType,
          threadId,
          // resume:true,
          allergyInfoAcknowledged: true,
        }),
      });

      const data = await res.json();
      console.log("📥 Resume Response:", data);

      if (data.threadId) {
        setThreadId(data.threadId);
      }

      if (data.status === "interrupt") {
        setInterruptData(data.interruptData);
        setPendingSelection("");
        setLoading(false);
        return;
      }

      if (data.status === "error") {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.status === "validation_error") {
        setError(data.message + ": " + (data.errors?.map(e => e.message).join(", ") || "Unknown error"));
        setLoading(false);
        return;
      }

      setInterruptData(null);
      setPendingSelection("");
      setResult(data);

    } catch (err) {
      console.error("❌ Resume error:", err);
      setError("Failed to continue recipe generation");
    } finally {
      setLoading(false);
    }
  };

  // Handle veg replacement selection
  const handleVegReplacementToggle = (nonVegItem, replacement) => {
    setSelectedVegReplacements(prev => {
      const current = prev[nonVegItem] || [];
      const isSelected = current.includes(replacement);
      if (isSelected) {
        return {
          ...prev,
          [nonVegItem]: current.filter(r => r !== replacement)
        }
      } else {
        return {
          ...prev,
          [nonVegItem]: [...current, replacement]
        };
      }
    })
  };
  // handle remove veg replacements
  const handleRemoveNonVegItems = () => {
    if (!interruptData?.conflicts) return;

    const nonVegItems = interruptData.conflicts.map(c => c.toLowerCase());
    const updatedFavorites = form.favorites
      .split(",")
      .map(f => f.trim())
      .filter(f => !nonVegItems.some(nv => f.toLowerCase().includes(nv)))
      .join(", ");

    setForm(prev => ({
      ...prev,
      favorites: updatedFavorites
    }));

    setInterruptData(null);
    setSelectedVegReplacements({});

    // Resubmit
    setTimeout(() => {
      const formElement = document.querySelector("form");
      if (formElement) formElement.requestSubmit();
    }, 100);
  };

  const handleReplaceNonVegItems = () => {
    if (!interruptData?.conflicts) return;

    const selected = Object.values(selectedVegReplacements).flat();

    if (selected.length === 0) {
      alert("Please select at least one replacement for each non-veg item");
      return;
    }

    const nonVegItems = interruptData.conflicts.map(c => c.toLowerCase());

    // Remove non-veg items
    const currentFavorites = form.favorites
      .split(",")
      .map(f => f.trim())
      .filter(Boolean)
      .filter(f => !nonVegItems.some(nv => f.toLowerCase().includes(nv)));

    // Add selected replacements
    const updatedFavorites = [...new Set([...currentFavorites, ...selected])];

    setForm(prev => ({
      ...prev,
      favorites: updatedFavorites.join(", ")
    }));

    setInterruptData(null);
    setSelectedVegReplacements({});

    // Resubmit
    setTimeout(() => {
      const formElement = document.querySelector("form");
      if (formElement) formElement.requestSubmit();
    }, 100);
  }
  const totalVegReplacements = Object.values(selectedVegReplacements).flat().length;
  // Handle allergy alternative selection
  const handleAlternativeToggle = (allergy, alternative) => {
    setSelectedAlternatives(prev => {
      const current = prev[allergy] || [];
      const isSelected = current.includes(alternative);

      if (isSelected) {
        // Remove if already selected
        return {
          ...prev,
          [allergy]: current.filter(a => a !== alternative)
        };
      } else {
        // Add to selection
        return {
          ...prev,
          [allergy]: [...current, alternative]
        };
      }
    });
  };

  // Continue with selected alternatives
  const handleContinueWithAlternatives = async () => {
    // Get all selected alternatives as a flat array
    const selected = Object.values(selectedAlternatives).flat();
    console.log("**************8selected Favorites*****************", selected);
    // parse current favorites
    const currentFavorites = form.favorites
      .split(", ")
      .map(f => f.trim())
      .filter(Boolean);

    const updatedFavorites = [...new Set([...currentFavorites, ...selected])];

    console.log("---------------------------Continuing with updated favorites------------------------", updatedFavorites);
    console.log("📤 Current form state before update:", form);

    setForm(prev => ({
      ...prev,
      favorites: updatedFavorites.join(", ")
    }));
    console.log("********************After updating favorites*********************", form);

    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/recipe_resume', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName: form.recipeName,
          favorites: updatedFavorites,
          allergies: form.allergies.split(", ").map(a => a.trim()).filter(Boolean),
          recipeType: form.recipeType,
          threadId,
          allergyInfoAcknowledged: true,
          resume: true
        })
      });
      const data = await res.json();
      console.log("---------------Updated resume data-------------", data)

      if (data.threadId) {
        setThreadId(data.threadId);
      }
      // handle another interrupt
      if (data.status === 'interrupt') {
        console.log("-----------------Another interrupt detected keeping selections---------------------");
        setInterruptData(data.interruptData)
        setLoading(false)
        return {}
      }
      if (data.status === 'error') {
        setError(data.error)
        setLoading(true)
        return {}
      }
      if (data.status === 'validation_error') {
        setError(data.message + ":" + (data.errors?.map(e => e.message).join(", ") || 'Unknown error'));
        setLoading(false);
        return {}
      }

      // Success
      console.log("Recipe generated successfully");

      setInterruptData(null)
      setSelectedAlternatives({})
      setResult(data);

    } catch (err) {
      console.error("-------------Continue Error---------------", err);
      setError("-------------Failed to continue recipe generator in resume route-----------------");

    } finally {
      setLoading(false);
    }
  };

  // Skip alternatives (don't add any)
  const handleSkipAlternatives = async () => {
    console.log("-----------Skipping alternatives, removing alergen from favorites------------------------");

    // parse current favorites and allergies
    const currentFavorites = form.favorites.split(", ").map(f => f.trim()).filter(Boolean);
    const currentAllergy = form.allergies.split(", ").map(a => a.trim()).filter(Boolean);


    // remove any favorite that contain allergen
    const cleanedFavorites = currentFavorites.filter(fav => {
      const favLower = fav.toLowerCase();
      return !currentAllergy.some(allergy => {
        const allergyLower = allergy.toLowerCase();
        // check if favorite conatin allergy
        const words = favLower.split(/[\s,-]+/);
        return favLower === allergyLower ||
          words.some(word => word === allergyLower || word.startsWith(allergyLower) || allergyLower.startsWith(word));
      });
    });
    console.log("Original favorites", currentFavorites);
    console.log("cleaned favorites", cleanedFavorites);

    setForm(prev => ({
      ...prev,
      favorites: cleanedFavorites.join(", ")
    }));

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/recipe_resume", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName: form.recipeName,
          favorites: cleanedFavorites,
          allergies: currentAllergy,
          recipeType: form.recipeType,
          threadId,
          allergyInfoAcknowledged: true,
          // selection: form.selection,  
        }),
      });
      const data = await res.json();

      console.log("---------------------------Skip response--------------------", data);

      if (data.threadId) {
        setThreadId(data.threadId)
      }
      if (data.status === 'interrupt') {
        setInterruptData(data.interruptData)
        setLoading(false)
        return;
      }
      if (data.status === 'error') {
        setError(data.error)
        setLoading(false)
        return;
      }
      if (data.status === 'validation_error') {
        setError(data.message + ":" + (data.errors?.map(e => e.message).join(", ") || 'Unknown error'));
        setLoading(false)
        return;
      }
      setInterruptData(null)
      setSelectedAlternatives({})
      setResult(data)

    } catch (err) {
      console.error("--------------------skip error in handleSkipAlternatives -------- ", err)
      setError("---------------Failed to continue recipe generator in handleSkipAlternatives -----------")

    } finally {
      setLoading(false)
    }
  };

  // Remove from favorites (keep in allergies)
  const handleKeepInAllergy = (conflict) => {
    if (!conflict) return;

    const favoriteToRemove = conflict.favorite.toLowerCase();
    const updatedFavoritesArray = form.favorites
      .split(",")
      .map(f => f.trim())
      .filter(f => f.toLowerCase() !== favoriteToRemove);

    const remainingConflicts = interruptData.conflicts
      .filter(c => c.favorite.toLowerCase() !== favoriteToRemove);

    setForm(prev => ({
      ...prev,
      favorites: updatedFavoritesArray.join(", ")
    }));

    if (remainingConflicts.length === 0) {
      setInterruptData(null);

      setTimeout(() => {
        const formElement = document.querySelector("form");
        if (formElement) formElement.requestSubmit();
      }, 100);
    } else {
      setInterruptData(prev => ({
        ...prev,
        conflicts: remainingConflicts,
      }));
    }
  };

  // Remove from allergies (keep in favorites)
  const handleKeepInFavorite = (conflict) => {
    if (!conflict) return;

    const allergyToRemove = conflict.allergy.toLowerCase();
    const updatedAllergiesArray = form.allergies
      .split(",")
      .map(a => a.trim())
      .filter(a => a.toLowerCase() !== allergyToRemove);

    const remainingConflicts = interruptData.conflicts
      .filter(c => c.allergy.toLowerCase() !== allergyToRemove);

    setForm(prev => ({
      ...prev,
      allergies: updatedAllergiesArray.join(", ")
    }));

    if (remainingConflicts.length === 0) {
      setInterruptData(null);

      setTimeout(() => {
        const formElement = document.querySelector("form");
        if (formElement) formElement.requestSubmit();
      }, 100);
    } else {
      setInterruptData(prev => ({
        ...prev,
        conflicts: remainingConflicts,
      }));
    }
  };

  // Count total selected alternatives
  const totalSelected = Object.values(selectedAlternatives).flat().length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto flex gap-6">

        {/* FORM */}
        <form className="flex-1 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold mb-6 text-gray-800">🍳 Recipe Generator</h1>

          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Recipe Name *
              </label>
              <input
                type="text"
                value={form.recipeName}
                onChange={(e) => setForm({ ...form, recipeName: e.target.value })}
                className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Pasta, Pizza, Salad"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Favorite Ingredients (comma-separated)
              </label>
              <input
                type="text"
                value={form.favorites}
                onChange={(e) => setForm({ ...form, favorites: e.target.value })}
                className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. tomatoes, cheese, basil"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. nuts, dairy, gluten"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Recipe Type *
              </label>
              <select
                value={form.recipeType}
                onChange={(e) => setForm({ ...form, recipeType: e.target.value })}
                className="text-gray-700 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="veg">Vegetarian</option>
                <option value="nonVeg">Non-Vegetarian</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? "⏳ Generating..." : "🚀 Generate Recipe"}
            </button>
          </div>
        </form>

        {/* RIGHT PANEL - INTERRUPTS & RESULTS */}
        <div className="flex-1 space-y-4">
          {/* Favorite vs Allergy Conflict */}
          {interruptData && interruptData.key === "favorite_vs_allergy_conflict" && (
            <div className="p-6 bg-red-100 border-2 border-red-300 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2 text-red-700">
                ⚠️ Conflicting Favorites Found
              </h2>
              <p className="text-red-600 mb-3">{interruptData.message}</p>

              <div className="space-y-3">
                {interruptData.conflicts?.map((c, i) => (
                  <div key={i} className="bg-white p-4 rounded-md border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-500 text-xl">❌</span>
                      <p className="text-gray-700">
                        Favorite <strong className="text-red-700">{c.favorite}</strong> conflicts with allergy <strong className="text-red-700">{c.allergy}</strong>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        className="bg-orange-600 text-white px-3 py-2 rounded-md flex-1 hover:bg-orange-700 transition-colors text-sm font-medium cursor-pointer"
                        onClick={() => handleKeepInAllergy(c)}
                      >
                        Remove from Favorites
                      </button>

                      <button
                        className="bg-blue-600 text-white px-3 py-2 rounded-md flex-1 hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                        onClick={() => handleKeepInFavorite(c)}
                      >
                        Remove from Allergies
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                💡 Resolve each conflict by choosing which list to keep the ingredient in
              </p>
            </div>
          )}
          {/* "non_veg_favorites_conflict"  Interrupt*/}
          {
            interruptData && interruptData.key === "non_veg_favorites_conflict" && (
              <div className="p-6 bg-red-100 border-2 border-red-300 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2 text-yellow-900 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  Non-Vegetarian Items Detected
                </h2>
                <p className="text-yellow-800 mb-4">{interruptData.message}</p>

                <div className="space-y-4 mb-4">
                  {interruptData.replacements?.map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-md border-2 border-yellow-300">
                      <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">🚫</span>
                        {item.item}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">Select vegetarian replacements:</p>
                      <div className="space-y-2">
                        {item.suggestions?.map((suggestion, j) => {
                          const isSelected = selectedVegReplacements[item.item]?.includes(suggestion);
                          return (
                            <button
                              key={j}
                              type="button"
                              onClick={() => handleVegReplacementToggle(item.item, suggestion)}
                              disabled={loading}
                              className={`w-full text-left px-4 py-2 rounded-md transition-all border-2 ${isSelected
                                ? 'bg-green-50 border-green-500 text-green-800 font-medium'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-yellow-400'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-lg">
                                  {isSelected ? '✅' : '⚪'}
                                </span>
                                {suggestion}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {selectedVegReplacements[item.item]?.length > 0 && (
                        <p className="text-sm text-green-700 mt-2 font-medium">
                          ✓ {selectedVegReplacements[item.item].length} selected
                        </p>
                      )}

                    </div>
                  ))}
                </div>
                {loading && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-center">
                    <div className="animate-spin text-2xl mb-1">🔄</div>
                    <p className="text-sm text-yellow-700">Updating recipe...</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleRemoveNonVegItems}
                    disabled={loading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🗑️ Remove All Non-Veg Items
                  </button>

                  <button
                    type="button"
                    onClick={handleReplaceNonVegItems}
                    disabled={loading || totalVegReplacements === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {totalVegReplacements > 0
                      ? `🔄 Replace with ${totalVegReplacements} Item${totalVegReplacements > 1 ? 's' : ''}`
                      : '🔄 Replace (Select items)'}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  💡 Choose vegetarian alternatives or remove non-veg items entirely
                </p>

              </div>
            )
          }
          {/* post validation UI */}
          {
            interruptData && interruptData.key === "post_recipe_allergy" && (
              <div className="p-6 bg-red-100 border-2 border-red-300 rounded-lg shadow-md max-w-lg mx-auto mt-4">
                <h2 className="text-xl font-bold mb-3 text-red-700">⚠️ Recipe Contains Allergens</h2>
                <p className="text-gray-800 mb-4">
                  The generated recipe includes ingredients you are allergic to:
                </p>

                <ul className="list-disc ml-6 text-red-800 font-semibold mb-4">
                  {interruptData.found.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>

                <p className="text-gray-700 mb-4">
                  Choose what you want to do next:
                </p>

                <div className="flex gap-4 justify-end">

                  {/* Regenerate button */}
                  <button
                    onClick={() => submitResume("regenerate_without_allergens")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Regenerate Without Allergens
                  </button>

                  {/* Continue anyway button */}
                  <button
                    onClick={() => submitResume("accept_anyway")}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    View Recipe Anyway
                  </button>

                </div>

              </div>
            )
          }

          {/* Allergy Information with Selection - UPDATED */}
          {interruptData && interruptData.key === "allergy_info" && (
            <div className="p-6 bg-blue-100 border-2 border-blue-300 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2 text-blue-900">
                ℹ️ Allergy Alternatives
              </h2>
              <p className="text-blue-700 mb-4">{interruptData.message}</p>

              <div className="space-y-4 mb-4">
                {interruptData.allergyAlternatives?.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-md border border-blue-200">
                    <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">🚫</span>
                      {item.allergy}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">Select safe alternatives to add to your favorites:</p>

                    <div className="space-y-2">
                      {item.alternatives.map((alt, j) => {
                        const isSelected = selectedAlternatives[item.allergy]?.includes(alt);
                        return (
                          <button
                            key={j}
                            onClick={() => handleAlternativeToggle(item.allergy, alt)}
                            className={`w-full text-left px-4 py-2 rounded-md transition-all border-2 ${isSelected
                              ? 'bg-green-50 border-green-500 text-green-800 font-medium'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-400'
                              }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-lg">
                                {isSelected ? '✅' : '⚪'}
                              </span>
                              {alt}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedAlternatives[item.allergy]?.length > 0 && (
                      <p className="text-sm text-green-700 mt-2 font-medium">
                        ✓ {selectedAlternatives[item.allergy].length} selected
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {/* Show loading indicator when processing */}
              {loading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-center">
                  <div className="animate-spin text-2xl mb-1">🔄</div>
                  <p className="text-sm text-blue-700">Processing your selections...</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkipAlternatives}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-md transition-colors font-semibold"
                >
                  ⏭️ Skip Alternatives
                </button>

                <button
                  onClick={handleContinueWithAlternatives}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors font-semibold"
                >
                  {totalSelected > 0
                    ? `✅ Add ${totalSelected} & Continue`
                    : '✅ Continue'}
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-3 text-center">
                💡 Selected ingredients will be added to your favorites
              </p>
            </div>
          )}


          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg text-red-700">
              <div className="flex items-start gap-2">
                <span className="text-xl">❌</span>
                <div>
                  <strong className="block mb-1">Error:</strong>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {result && result.status === "success" && result.recipe && (
            <div className="bg-white p-6 shadow-lg rounded-lg border-2 border-green-200">
              <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <span>✅</span>
                <span>{result.recipe.name || "Untitled Recipe"}</span>
              </h2>

              {result.recipe.ingredients && result.recipe.ingredients.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">
                    📝 Ingredients
                  </h3>
                  <ul className="list-disc ml-6 space-y-1 text-gray-700 bg-gray-50 p-4 rounded-md">
                    {result.recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </>
              )}

              {result.recipe.steps && result.recipe.steps.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800">
                    👨‍🍳 Steps
                  </h3>
                  <ol className="list-decimal ml-6 space-y-2 text-gray-700 bg-gray-50 p-4 rounded-md">
                    {result.recipe.steps.map((s, idx) => (
                      <li key={idx} className="leading-relaxed">{s}</li>
                    ))}
                  </ol>
                </>
              )}

              {(!result.recipe.ingredients || result.recipe.ingredients.length === 0) &&
                (!result.recipe.steps || result.recipe.steps.length === 0) && (
                  <p className="text-yellow-600 bg-yellow-50 p-4 rounded-md">
                    ⚠️ Recipe generated but missing details. Please try again.
                  </p>
                )}
            </div>
          )}

          {/* Loading State */}
          {loading && !interruptData && (
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 text-center">
              <div className="animate-spin text-4xl mb-2">🔄</div>
              <p className="text-blue-700 font-semibold">Generating your recipe...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ```

// ---

// ## **Key Features Added:**

// 1. **✅ Clickable Alternatives**: Each alternative is a button that can be selected/deselected
// 2. **Visual Feedback**: Selected items show with green background and checkmark
// 3. **Counter**: Shows how many alternatives are selected
// 4. **Two Options**:
//    - **Skip**: Don't add any alternatives, just continue
//    - **Add & Continue**: Add selected alternatives to favorites and continue
// 5. **Multi-select**: Users can select multiple alternatives across different allergies

// ---

// ## **How It Works:**

// 1. User sees allergy alternatives
// 2. Clicks on alternatives they want (can select multiple)
// 3. Selected items turn green with ✅
// 4. Counter updates: "Add 3 & Continue"
// 5. User clicks:
//    - **Skip** → No changes, just continue
//    - **Add X & Continue** → Selected alternatives added to favorites, then continue

// ---

// ## **Example Flow:**
// ```
// Allergies: nuts, garlic

// ┌─────────────────────────────┐
// │ 🚫 nuts                     │
// │ ⚪ seeds      (click)       │
// │ ✅ dried fruit (selected)   │
// │ ⚪ oats       (click)       │
// └─────────────────────────────┘

// ┌─────────────────────────────┐
// │ 🚫 garlic                   │
// │ ✅ onion      (selected)    │
// │ ⚪ leek       (click)       │
// │ ⚪ shallots   (click)       │
// └─────────────────────────────┘

// [Skip] [Add 2 & Continue]