import os

import PIL
from PIL import Image

import gpxpy

def move_gpx_files():
    gpx_files = os.listdir('./uploads/gpx_files/')
    for file in gpx_files:
        try:
            os.rename('./uploads/gpx_files/'+file, './gpx_files/'+file)
        except:
            print('WARN: could not move ./uploads/gpx_files/'+file)

def get_timestamp(image):
    try:
        print(image + ' was created on:')
        day, time = Image.open('./uploads/images/' + image)._getexif()[36867].split(' ')
        timestamp = day.replace(':', '-') + 'T' + time
        print('  ' + timestamp)
        return timestamp
    except:
        print('INFO: could not find timestamp of ./uploads/images/'+image)
        return None

def get_location(timestamp):
    print(timestamp)
    day, time = timestamp.split('T')
     
    # look for a gpx file that day
    is_gpx_file = False
    for gpx_file_str in os.listdir('./data/gpx_files/'):
        if day in gpx_file_str:
            print('according gpx file found')
            print('parsing gpx file ...')
            gpx_file = open('./data/gpx_files/'+gpx_file_str, "r")
            gpx = gpxpy.parse(gpx_file)

            # set lat, lon to the first track point
            # if no timestamps are recorded the markers will apper at the start of the track
            startpoint = gpx.tracks[0].segments[0].points[0]
            lat, lon = startpoint.latitude, startpoint.longitude

            # look for the last trackpoint before the time
            for trackpoint in gpx.tracks[0].segments[0].points:
                if trackpoint.time == None: continue
                if time < trackpoint.time:
                    lat, lon = trackpoint.latitude , trackpoint.longitude
            
            print(f'last location before the image was taken: {lat,lon}')
            return (lat, lon)

def move_images():
    images = os.listdir('./uploads/images/')

    for image in images:
        timestamp = get_timestamp(image)

        if timestamp == None:
            os.rename('./uploads/images/'+image, './data/images/untimed/'+image)
            continue
        
        lat, lon = get_location(timestamp)
        print(f'moving image to ./data/images/located/({lat},{lon})_{timestamp}.{image.split(".")[-1]}')
        os.rename('./uploads/images/'+image, f'./data/images/located/({lat},{lon})_{timestamp}.{image.split(".")[-1]}')

def main():
    move_gpx_files()
    move_images()

if __name__ == '__main__': main()