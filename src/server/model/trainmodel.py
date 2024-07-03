from tensorflow.keras.models import load_model
from keras.optimizers import Adam
import sys
import numpy as np

model = load_model('./src/server/model/best_model.h5')

# input data
user_input = [int(angka) for angka in sys.argv[1].split(',') if angka]
place_input = [int(angka) for angka in sys.argv[2].split(',') if angka]
category_input = [int(angka) for angka in sys.argv[3].split(',') if angka]
city_input = [int(angka) for angka in sys.argv[4].split(',') if angka]
rating_place_input = [int(angka) for angka in sys.argv[5].split(',') if angka]
verified_input = [int(angka) for angka in sys.argv[6].split(',') if angka]
rating_input = [int(angka) for angka in sys.argv[7].split(',') if angka]
place_encode =  [int(angka) for angka in sys.argv[8].split(',')]
category_encode = [int(angka) for angka in sys.argv[9].split(',')]
city_encode = [int(angka) for angka in sys.argv[10].split(',')]
rating_encode = [int(angka) for angka in sys.argv[11].split(',')]
verified_encode = [int(angka) for angka in sys.argv[12].split(',')]

# Fit the model with the input data
if (len(user_input) != 0) :
    model.compile(loss='mean_squared_error', optimizer=Adam(learning_rate=0.0005))
    model.fit([np.array(user_input), np.array(place_input), np.array(category_input), np.array(city_input),np.array(rating_place_input), np.array(verified_input)],np.array(rating_input), epochs=1, verbose=0)

user_input_full = np.array([27499] * len(np.arange(1, 743)))

# Predict ratings for all places in batch
pred_ratings = model.predict([user_input_full, np.array(place_encode)-1,
                              np.array(category_encode),
                              np.array(city_encode),
                              np.array(rating_encode),
                              np.array(verified_encode)])
# Get top 20 recommendations
rekomendasi = sorted(zip(np.arange(1, 743), pred_ratings.flatten()), key=lambda x: x[1], reverse=True)[:20]
rekomendasi_place_ids = [place for place, rating in rekomendasi]

print(rekomendasi_place_ids)