using Forkful.Api.Models;

namespace Forkful.Api.Data;

public static class MenuSeed
{
    public static List<Dish> Dishes()
    {
        var dishes = new List<Dish>();

        void Add(int restaurantId, string category, string name, decimal price, string description = "", bool soldOut = false) =>
            dishes.Add(new Dish
            {
                Id = dishes.Count + 1,
                RestaurantId = restaurantId,
                Category = category,
                Name = name,
                Price = price,
                Description = description,
                SoldOut = soldOut,
            });

        // 1: Night Owl Noodles
        Add(1, "Noodle soups", "Pho bo", 13.50m, "Beef broth, rice noodles, Thai basil and lime");
        Add(1, "Noodle soups", "Pho ga", 12.50m, "Chicken broth, rice noodles, spring onion");
        Add(1, "Noodle soups", "Bun bo Hue", 14.00m, "Spicy lemongrass beef soup");
        Add(1, "Rice and noodles", "Bun cha", 13.00m, "Grilled pork, vermicelli, herbs and dipping sauce");
        Add(1, "Rice and noodles", "Com tam", 12.50m, "Broken rice, grilled pork chop, fried egg");
        Add(1, "Rice and noodles", "Lemongrass tofu", 11.50m, "Stir-fried tofu, vegetables, jasmine rice");
        Add(1, "Bites", "Summer rolls", 6.50m, "Two rice-paper rolls with prawns and herbs");
        Add(1, "Bites", "Crispy spring rolls", 6.00m, "Four pork and vegetable rolls");
        Add(1, "Bites", "Banh mi", 8.50m, "Baguette with pork, pickles and coriander", soldOut: true);
        Add(1, "Drinks", "Vietnamese iced coffee", 4.50m, "With condensed milk");

        // 2: Trattoria Sole
        Add(2, "Pizza", "Margherita", 11.00m, "Tomato, mozzarella, basil");
        Add(2, "Pizza", "Diavola", 13.50m, "Spicy salami, chilli, mozzarella");
        Add(2, "Pizza", "Quattro formaggi", 14.00m, "Mozzarella, gorgonzola, taleggio, parmesan");
        Add(2, "Pizza", "Funghi", 12.50m, "Mushrooms, garlic, mozzarella");
        Add(2, "Pasta", "Spaghetti carbonara", 13.00m, "Guanciale, egg yolk, pecorino");
        Add(2, "Pasta", "Penne arrabbiata", 11.50m, "Tomato, garlic, chilli");
        Add(2, "Pasta", "Lasagne al forno", 14.50m, "Beef ragu, bechamel", soldOut: true);
        Add(2, "Salads", "Insalata caprese", 9.50m, "Tomato, buffalo mozzarella, basil");
        Add(2, "Desserts", "Tiramisu", 6.50m);
        Add(2, "Desserts", "Panna cotta", 6.00m, "With berry compote");

        // 3: Sakura Bento
        Add(3, "Bento", "Chicken teriyaki bento", 15.50m, "Rice, salad, pickles");
        Add(3, "Bento", "Salmon bento", 17.50m, "Grilled salmon, rice, salad, pickles");
        Add(3, "Bento", "Tofu katsu bento", 14.50m, "Panko tofu, rice, salad");
        Add(3, "Sushi", "Salmon nigiri", 12.00m, "Six pieces");
        Add(3, "Sushi", "California roll", 11.00m, "Eight pieces");
        Add(3, "Sushi", "Spicy tuna roll", 12.50m, "Eight pieces");
        Add(3, "Hot dishes", "Chicken katsu curry", 14.00m, "Japanese curry, rice");
        Add(3, "Hot dishes", "Tonkotsu ramen", 15.00m, "Pork broth, chashu, egg");
        Add(3, "Sides", "Edamame", 5.00m, "With sea salt");
        Add(3, "Sides", "Miso soup", 3.50m);

        // 4: Masala House
        Add(4, "Curries", "Butter chicken", 15.50m, "Tandoori chicken in a tomato and butter sauce");
        Add(4, "Curries", "Lamb rogan josh", 17.00m, "Slow-cooked lamb, Kashmiri chilli");
        Add(4, "Curries", "Chana masala", 12.50m, "Chickpeas, tomato, ginger");
        Add(4, "Curries", "Palak paneer", 13.50m, "Spinach and paneer");
        Add(4, "Curries", "Chicken tikka masala", 15.50m);
        Add(4, "Biryani", "Chicken biryani", 16.00m, "With raita");
        Add(4, "Biryani", "Vegetable biryani", 13.50m, "With raita");
        Add(4, "Sides", "Garlic naan", 3.50m);
        Add(4, "Sides", "Pilau rice", 3.50m);
        Add(4, "Sides", "Onion bhaji", 5.50m, "Three pieces with mint chutney");

        // 5: Green Bowl
        Add(5, "Bowls", "Falafel bowl", 11.50m, "Hummus, tabbouleh, pickled red onion");
        Add(5, "Bowls", "Salmon poke bowl", 13.50m, "Sushi rice, avocado, edamame");
        Add(5, "Bowls", "Chicken quinoa bowl", 12.50m, "Roast vegetables, tahini");
        Add(5, "Bowls", "Buddha bowl", 11.00m, "Sweet potato, chickpeas, greens");
        Add(5, "Salads", "Caesar salad", 10.50m, "Chicken, romaine, parmesan, croutons");
        Add(5, "Salads", "Greek salad", 9.50m, "Feta, olives, cucumber, tomato");
        Add(5, "Wraps", "Hummus wrap", 8.50m, "Roast peppers, rocket");
        Add(5, "Wraps", "Chicken avocado wrap", 9.50m, soldOut: true);
        Add(5, "Drinks", "Green smoothie", 5.50m, "Spinach, apple, ginger");
        Add(5, "Drinks", "Fresh orange juice", 4.00m);

        // 6: Bistro Lune
        Add(6, "Starters", "French onion soup", 8.50m, "With a gruyere crouton");
        Add(6, "Starters", "Escargots", 11.00m, "Six snails in garlic butter");
        Add(6, "Starters", "Warm goat's cheese salad", 10.00m);
        Add(6, "Mains", "Steak frites", 24.50m, "Sirloin, fries, bearnaise");
        Add(6, "Mains", "Coq au vin", 21.00m, "Chicken braised in red wine");
        Add(6, "Mains", "Moules marinieres", 19.50m, "Mussels, white wine, fries");
        Add(6, "Mains", "Ratatouille", 16.50m, "With herb rice");
        Add(6, "Desserts", "Creme brulee", 7.50m);
        Add(6, "Desserts", "Tarte tatin", 8.00m, "With creme fraiche");
        Add(6, "Desserts", "Chocolate mousse", 7.00m);

        return dishes;
    }
}
