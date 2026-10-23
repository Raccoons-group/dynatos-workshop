# Forkful

Forkful is a food delivery app: customers order dishes from restaurants' menus, and restaurants prepare and deliver them.

## Language

### Ordering

**Restaurant**:
A business that offers dishes on Forkful and prepares the orders for them.
_Avoid_: Vendor, store, kitchen

**Dish**:
One thing a restaurant offers, with a name and a price.
_Avoid_: Menu item, product, item

**Menu**:
All the dishes one restaurant offers.

**Customer**:
A person who orders dishes from a restaurant.
_Avoid_: User, client

### Allergens

**Allergen**:
One of the 14 allergens that EU food law requires food businesses to declare: celery, cereals containing gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard, tree nuts, peanuts, sesame, soya and sulphites.
_Avoid_: Ingredient, dietary info

**Contains**:
A dish contains an allergen when the allergen is part of its recipe.

**May contain**:
A dish may contain an allergen when it isn't part of the recipe but can get in by contact during preparation.
_Avoid_: Traces, cross-contamination

**Not provided**:
The allergen state of a dish whose restaurant hasn't said anything about allergens yet. It's different from a dish the restaurant has declared to contain none of the allergens.
_Avoid_: Unknown, missing, none
