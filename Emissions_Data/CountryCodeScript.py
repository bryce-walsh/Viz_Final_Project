import pandas as pd 
import country_converter as coco
df = pd.read_csv('historical_emissions.csv')

df['ISO3'] = df['Country'].apply(lambda x: coco.convert(names=x, to='ISO3'))
df[df.ISO3 != 'not found'].to_csv('Emissions_with_ISO3.csv')
