author: Luca Sbardella
title: China Wine Regions
slug: china_wine_regions
date: 2014 November 01
description: A map of the top wine producing regions in China. Map created using mapbox, leaflet and d3js.
category: wine
image: $site_url$site_media/lucasbardella/blog/china-wine-regions.png
twitter-card: summary_large_image
require_css: leaflet
require_js: lucasbardella/lab/china-wine
---

<div data-options='chinamap' style="height: 400px"
data-src="$site_url$site_media/lucasbardella/blog/china_adm1.topo.json" data-giotto-chart></div>
<br>
<br>

China is the fifth largest wine producer in the world, the first four being France, Italy, Spain and the USA. Most of its production is consumed in the local market but some
examples have started to venture out in the export market.
Wine is produced in several regions as reported by
[wine searcher](http://www.wine-searcher.com/regions-china).
Here I briefly discuss the main four.

## Shandong

Located on the east coast, it is the biggest wine producing region in China.
Presently, there are more than 140 wineries in the region, mainly distributed
in the Nanwang Grape Valley and along the Yan-Peng Sightseeing Highway.
The region produced more than 40% of China's grape wine production.

The main problem of this coastal region, is that it is so wet in summer that
sometimes it is a struggle to harvest fully ripe, healthy grapes.

## Shanxi

<img src="$site_url$site_media/lucasbardella/blog/grace-deep-blue-several-bottles.jpg"
class="pull-right img-rounded hidden-xs" style="width: 350px; margin-left: 20px">

This is a large region on the west of Beijing and has a continental climate
with some effect of the eastern monsoons which characterise the climate in
Shandong. The region is of high altitude and therefore it offers high diurnal
temperature variations and more sunshine than Shandong.
The region was made famous by [Grace vineyard](http://www.grace-vineyard.com/?lang=en)
and its Deep Blue wine, a Bordeaux blend (Cabernet Sauvignon, Merlot, Cabernet Franc,
Petit Verdot) which has earned very positive reviews from the western wine
commentators.

<img src="$site_url$site_media/lucasbardella/blog/grace-deep-blue-several-bottles.jpg"
class="img-responsive img-rounded visible-xs">

## Ningxia-Hui

Located in north-west of the Country, it came to prominence in 2007
with the inauguration of [Silver Heights](http://www.silverheights.com.cn/),
China’s first boutique winery.
Most viticulture takes place in a 100-mile-long (160km) river valley in the
very north of the region. Here, the [Yellow River](http://en.wikipedia.org/wiki/Yellow_River)
provides sufficient water
for irrigation and the arid landscape has been transformed into arable land
well suited to the production of wine.

Notable producers, located near the Helan Mountain and the Yellow River

* [Silver Height](http://www.silverheights.com.cn/). Vineyards located above 1,000 metres in altitude. The owner, Emma Gao, had trained in Bordeaux and her investment demonstrated the potential of the area for quality grape growing. Wines are made from Bordeux blends dominated by Cabernet Sauvignon and to a lesser extend Cabernet Gernischt (also known as Carmenère) and Merlot.
* [Chandon Ningxia](http://www.lvmh.com/the-group/lvmh-companies-and-brands/wines-spirits/domaine-chandon-china) is a modern new vinery owned by Moët Hennessy. The region offers excellent growing conditions for the estate’s two Champagne grape varieties, Chardonnay and Pinot Noir, essential for producing premium sparkling wines made with the [traditional method](http://en.wikipedia.org/wiki/Sparkling_wine_production). First vintage is the 2014.
* [Helan Mountain](http://www.helanmountain.com/) was founded in 1997 and in 2012 was bought by Diageo. Produces varietal wines from Cabernet Sauvignon, Merlot and Chardonnay.

The short growing season in Ningxia is followed by a long, cold winter, and vines
must be protected from freezing temperatures with an insulating mound of
dirt piled around the base of the plant.
The labour costs required to bury the vines each year, are considerable and will
be a major overhead for wineries.
Emma Gao adds:
> The right choice of hybrid is crucial when embarking on a project in Ningxia, to ensure they can tolerate our extreme winters that last for many months!


## Yunnan

This is a relatively [new region](http://www.jancisrobinson.com/articles/chinas-new-wine-frontier)
for wine production. Here,
Moët Hennessy has partnered with the Chinese
[VATS Group](http://www.vats.com.cn/) in the [Deqen county](http://www.vats.com.cn/en/2xwzx_1hzxw_1jtxw_xx.aspx?news_id=11393)
with vineyards at an average altitude of about 2,400 metres.
Moet Hennessy are aiming to produce high
quality red wines made mainly from Cabernet Sauvignon and Merlot.


## The map

This session is for the geeks!

The map uses the great [d3][] and [leaflet](http://leafletjs.com/)
javascript libraries. Tiles are provided by [mapbox](https://www.mapbox.com/) while boundary data is from
[Diva administrative areas](http://www.diva-gis.org/gdata).
The four regions were extracted using the [GDAL](http://www.gdal.org/) library on a mac:

    brew install gdal

and conversion of the four regions data into GeoJSON format

    ogr2ogr \
        -f GeoJSON \
        -where "NAME_1 in ('Shanxi', 'Ningxia Hui', 'Yunnan', 'Shandong')"\
        china_adm1.json\
        CHN_adm1.shp


I used [topojson](https://github.com/mbostock/topojson/wiki) to reduce the size of the
JSON file. Topojson requires [nodejs](http://nodejs.org/) to be installed:

    brew install node
    npm install -g topojson
    topojson -o china_adm1.topo.json -p name=NAME_1 china_adm1.json

The <a href="$site_url$site_media/lucasbardella/blog/china_adm1.topo.json" target="_self">china_adm1.topo.json</a> is 244 KB in size while
<a href="$site_url$site_media/lucasbardella/blog/china_adm1.json" target="_self">china_adm1.json</a> is 3.2 MB,
quite a big saving! This step includes a minor transformation renaming the ``NAME_1``
property to ``name``. Check out a great tutorial by [Mike Bostock](http://bost.ocks.org/mike/)
form more insight on how to [make a map](http://bost.ocks.org/mike/map/).

Working with [d3 & leaflet](http://bost.ocks.org/mike/leaflet/) is not too
difficult and I've written a [d3 extension](http://quantmind.github.io/d3ext/examples/leaflet)
for it.

The source code for the map is available <a href="$site_url$site_media/lucasbardella/lab/china-wine.js" target="_self">here</a>.
