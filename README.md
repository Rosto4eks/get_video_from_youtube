node js application, which helps you to download video from youtube with choosed quality
# How it works?
choose quality of video
video and audio are downloaded separately due to the specifics of YouTube, then merging into 1 .mp4 file
# How to use it?
at first, build and run application
```console 
$ npm run build
$ npm start
```
then, paste the video link
```console 
? paste the link: » https://www.youtube.com/watch?v=mkggXE5e2yk&t=32s
```
```console
√ paste the link: ... https://www.youtube.com/watch?v=mkggXE5e2yk&t=32s
? choose the quality: » - Use arrow-keys. Return to submit.
>   720p
    480p
    360p
    240p
```
after choosing video will be downloading 
# important
should be a `downloads` folder and a `parts` folder in it
