# ml/synth/meal_library.py
import numpy as np

INDIAN_MEALS = {
    'roti': {'carbs': 15, 'gi': 55, 'meal': ['lunch', 'dinner'], 'region': ['north', 'west', 'east']},
    'chapati': {'carbs': 15, 'gi': 52, 'meal': ['lunch', 'dinner'], 'region': ['north', 'west']},
    'white_rice': {'carbs': 45, 'gi': 73, 'meal': ['lunch', 'dinner'], 'region': ['south', 'east', 'west']},
    'brown_rice': {'carbs': 45, 'gi': 68, 'meal': ['lunch', 'dinner'], 'region': ['south', 'east', 'west']},
    'dal': {'carbs': 20, 'gi': 29, 'meal': ['lunch', 'dinner'], 'region': ['north', 'south', 'east', 'west']},
    'rajma': {'carbs': 22, 'gi': 29, 'meal': ['lunch', 'dinner'], 'region': ['north']},
    'chole': {'carbs': 27, 'gi': 33, 'meal': ['lunch', 'dinner'], 'region': ['north']},
    'poha': {'carbs': 40, 'gi': 65, 'meal': ['breakfast', 'snack'], 'region': ['west', 'north']},
    'upma': {'carbs': 35, 'gi': 68, 'meal': ['breakfast'], 'region': ['south', 'west']},
    'idli': {'carbs': 15, 'gi': 70, 'meal': ['breakfast'], 'region': ['south']},
    'dosa': {'carbs': 30, 'gi': 77, 'meal': ['breakfast', 'dinner'], 'region': ['south']},
    'paratha': {'carbs': 40, 'gi': 62, 'meal': ['breakfast', 'lunch'], 'region': ['north']},
    'aloo_sabzi': {'carbs': 25, 'gi': 75, 'meal': ['lunch', 'dinner'], 'region': ['north', 'east', 'west']},
    'mixed_veg_sabzi': {'carbs': 15, 'gi': 45, 'meal': ['lunch', 'dinner'], 'region': ['north', 'east', 'south', 'west']},
    'curd': {'carbs': 5, 'gi': 28, 'meal': ['lunch', 'dinner'], 'region': ['north', 'south', 'east', 'west']},
    'paneer_butter_masala': {'carbs': 12, 'gi': 30, 'meal': ['lunch', 'dinner'], 'region': ['north', 'west']},
    'palak_paneer': {'carbs': 10, 'gi': 25, 'meal': ['lunch', 'dinner'], 'region': ['north']},
    'chicken_curry': {'carbs': 5, 'gi': 0, 'meal': ['lunch', 'dinner'], 'region': ['north', 'south', 'east', 'west'], 'diet': 'non-vegetarian'},
    'egg_curry': {'carbs': 5, 'gi': 0, 'meal': ['lunch', 'dinner'], 'region': ['north', 'south', 'east', 'west'], 'diet': 'eggetarian'},
    'fish_curry': {'carbs': 5, 'gi': 0, 'meal': ['lunch', 'dinner'], 'region': ['east', 'south'], 'diet': 'non-vegetarian'},
    'samosa': {'carbs': 24, 'gi': 70, 'meal': ['snack'], 'region': ['north', 'east', 'west', 'south']},
    'pakora': {'carbs': 15, 'gi': 65, 'meal': ['snack'], 'region': ['north', 'east', 'west']},
    'kachori': {'carbs': 30, 'gi': 68, 'meal': ['snack'], 'region': ['north', 'west']},
    'biryani_chicken': {'carbs': 50, 'gi': 65, 'meal': ['lunch', 'dinner'], 'region': ['south', 'north'], 'diet': 'non-vegetarian'},
    'biryani_veg': {'carbs': 55, 'gi': 68, 'meal': ['lunch', 'dinner'], 'region': ['south', 'north']},
    'gulab_jamun': {'carbs': 25, 'gi': 85, 'meal': ['snack', 'dinner'], 'region': ['north', 'east', 'west', 'south']},
    'jalebi': {'carbs': 30, 'gi': 90, 'meal': ['snack', 'breakfast'], 'region': ['north', 'west']},
    'ladoo': {'carbs': 20, 'gi': 75, 'meal': ['snack'], 'region': ['north', 'south', 'east', 'west']},
    'rasgulla': {'carbs': 22, 'gi': 80, 'meal': ['snack'], 'region': ['east']},
    'chai_with_sugar': {'carbs': 15, 'gi': 65, 'meal': ['breakfast', 'snack'], 'region': ['north', 'east', 'west', 'south']},
    'filter_coffee': {'carbs': 12, 'gi': 60, 'meal': ['breakfast', 'snack'], 'region': ['south']},
    'apple': {'carbs': 25, 'gi': 39, 'meal': ['snack', 'breakfast'], 'region': ['north', 'south', 'east', 'west']},
    'banana': {'carbs': 27, 'gi': 51, 'meal': ['snack', 'breakfast'], 'region': ['north', 'south', 'east', 'west']},
    'mango': {'carbs': 30, 'gi': 55, 'meal': ['snack'], 'region': ['north', 'south', 'east', 'west']},
    'papaya': {'carbs': 15, 'gi': 60, 'meal': ['breakfast', 'snack'], 'region': ['north', 'south', 'east', 'west']},
    'bhindi_masala': {'carbs': 10, 'gi': 40, 'meal': ['lunch', 'dinner'], 'region': ['north', 'west']},
    'baingan_bharta': {'carbs': 12, 'gi': 45, 'meal': ['lunch', 'dinner'], 'region': ['north', 'west']},
    'pav_bhaji': {'carbs': 45, 'gi': 75, 'meal': ['lunch', 'snack'], 'region': ['west']},
    'vada_pav': {'carbs': 35, 'gi': 78, 'meal': ['snack'], 'region': ['west']},
    'dhokla': {'carbs': 20, 'gi': 40, 'meal': ['breakfast', 'snack'], 'region': ['west']},
    'khichdi': {'carbs': 35, 'gi': 50, 'meal': ['lunch', 'dinner'], 'region': ['north', 'west', 'east']},
    'mutton_rogan_josh': {'carbs': 5, 'gi': 0, 'meal': ['lunch', 'dinner'], 'region': ['north'], 'diet': 'non-vegetarian'},
    'pongal': {'carbs': 40, 'gi': 65, 'meal': ['breakfast'], 'region': ['south']},
    'bisibelebath': {'carbs': 45, 'gi': 60, 'meal': ['lunch'], 'region': ['south']}
}

def sample_meal(diet_type, region, meal_type):
    valid_meals = []
    for meal_id, details in INDIAN_MEALS.items():
        if meal_type in details['meal'] and region in details['region']:
            if details.get('diet', diet_type) == diet_type or details.get('diet') is None:
                valid_meals.append(meal_id)
                
    if not valid_meals:
        # Fallback if no exact match
        for meal_id, details in INDIAN_MEALS.items():
            if meal_type in details['meal']:
                valid_meals.append(meal_id)
                
    selected = np.random.choice(valid_meals)
    
    # Adjust portion sizes (e.g. 1 to 3 items if it's roti, or 1 to 1.5 portions of rice)
    portion = np.random.uniform(0.8, 1.5)
    if 'roti' in selected or 'chapati' in selected or 'idli' in selected:
        portion = np.random.randint(1, 4)
        
    return {
        'id': selected,
        'carbs': INDIAN_MEALS[selected]['carbs'] * portion,
        'gi': INDIAN_MEALS[selected]['gi']
    }
