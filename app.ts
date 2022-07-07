import ytdl from 'ytdl-core'
import fs from 'fs'
import prompts from 'prompts'
import ProgressBar from 'progress'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegpath from '@ffmpeg-installer/ffmpeg'
ffmpeg.setFfmpegPath(ffmpegpath.path)

async function getVideo() {

  let qualities: any[] = []

  const { link } = await prompts({
    type: 'text',
    name: 'link',
    message: 'paste the link:',
    validate: (value: string) => ytdl.validateURL(value)
  })

  const { formats, videoDetails } = await ytdl.getInfo(link)
  formats.forEach(item => {
    if (item.qualityLabel != null && item.container === 'mp4' && item.hasAudio === false) qualities.push({title: `${item.qualityLabel}`, value: item.itag})
  })
  qualities = qualities.filter(elem => elem.value === 132 || elem.value === 133 || elem.value === 134 || elem.value === 135 || elem.value === 136 || elem.value === 137 || elem.value === 138 || elem.value === 139)
    
  const { quality } = await prompts({
    type: 'select',
    name: 'quality',
    message: 'choose the quality:',
    choices: qualities
  })

  const video = formats.filter( (item: any) => item.itag === quality)
  const audio = formats.filter( (item: any) => item.hasVideo === false)
  const name = videoDetails.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '')

  let videoBar: ProgressBar
  let audioBar: ProgressBar
  const streamV = fs.createWriteStream(`downloads/parts/${name}.mp4`)
  ytdl(link, {quality: quality})
    .on('info', async () => {
    console.log("\u001b[32m  downloading video \u001b[0m")
    videoBar = new ProgressBar('  :bar  ', {
        total: +video[0].contentLength,
        complete: "\u001b[42m \u001b[0m",
        incomplete: "\u001b[47m \u001b[0m",
        width: 75
    })
  })
    .on('data', async (data) => {
    videoBar.tick(data.length)
  })
    .pipe(streamV)
    .on('close', async () => {
    const streamA = fs.createWriteStream(`downloads/parts/${name}.wav`)
    ytdl(link, {highWaterMark: 1<<25, filter: 'audioonly'})
      .on('info', async () => {
      console.log("\n\u001b[32m  downloading audio \u001b[0m")
      audioBar = new ProgressBar('  :bar  ', {
          total: +audio[0].contentLength,
          complete: "\u001b[42m \u001b[0m",
          incomplete: "\u001b[47m \u001b[0m",
          width: 75
      })
    })
      .on('data', async (data) => {
      audioBar.tick(data.length)
    })
      .pipe(streamA)
      .on('close', async () => {
      ffmpeg()
        .addInput(`downloads/parts/${name}.mp4`)
        .addInput(`downloads/parts/${name}.wav`)
        .on('start', () => {
          console.log('\n\u001b[32m  merging files \u001b[0m')
        })
        .on('error',async (error) => {
          console.log(error)
      })
        .save(`downloads/${name}.mp4`)
        .on('end', async () => {
          const { end } = await prompts({
            type: 'select',
            name: 'end',
            message: 'continue?',
            choices: [{title: "continue", value: true }, {title: "exit", value: false}]
          })
          if (end === true) getVideo()
          else process.exit()
        })
    })

  })

}

getVideo()
