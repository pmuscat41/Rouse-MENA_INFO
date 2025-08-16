import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import geopandas as gpd
import os
import requests

# List of countries to shade
countries = ["United Arab Emirates", "Saudi Arabia", "Oman", "Qatar", "Bahrain", "Kuwait"]

# Download GeoJSON file if not present
geojson_url = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
geojson_path = "countries.geo.json"
if not os.path.exists(geojson_path):
    r = requests.get(geojson_url)
    with open(geojson_path, "wb") as f:
        f.write(r.content)

# Load country polygons
gdf = gpd.read_file(geojson_path)

for country in countries:
    fig = plt.figure(figsize=(10, 6))
    ax = plt.axes(projection=ccrs.PlateCarree())
    ax.add_feature(cfeature.BORDERS, linewidth=1)
    ax.add_feature(cfeature.COASTLINE)
    ax.set_extent([30, 65, 10, 35])  # Middle East region
    ax.set_title(f"{country}")

    # Shade selected country
    country_shape = gdf[gdf['name'] == country]
    if not country_shape.empty:
        country_shape.plot(ax=ax, facecolor='turquoise', edgecolor='black', linewidth=1, alpha=0.6)
    else:
        print(f"Country not found: {country}")

    plt.show()
