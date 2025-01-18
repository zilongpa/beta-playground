# Beta Playground

An app designed for students to explore and study the `Beta Processor`, facilitating hands-on learning and experimentation with processor architecture and instruction execution.

- **This is just a proof of concept version for Beta Playground since I (Michael) struggled with transferring the application during the winter vacation. But I really hope this can help with understanding how processors work.**
- Currently, there are many obvious glitches in this program, but we haven't made a list of them. So, feel free to open an issue if you see any, or even make a pull request.
- If you're interested in some of the implementations but can't understand our ugly code, also make an issue and we'll try to make it more human-readable. (Hopefully)
- Although it currently only supports a few instructions, the framework of the emulator is done, and Jacky will be responsible for adding more support for other instructions.

Developers:
- Junhui Huang (Michael) at Boston University
- Jiaqi Yang (Jacky) at Boston University

## Todo
0. Support negative constants
1. Replace JS language support with custom language support
2. Allow RAM and register edit
3. Reminder for dirty values
4. Settings panel
5. Layout fix
6. Support macros

## For those who are interested in processors

There's a game on Steam called [Turing Complete](https://store.steampowered.com/app/1444480/Turing_Complete/) that allows you to build a processor from scratch. Even though I didn't buy it because I missed the discount, it seems to be a lot of fun.

## For those who are bored now

Here are some fun things:

1. Even though this is a web app, I still packaged a desktop version using Tauri to make it look **professional**.
2. If you want to use `react-mosaic`, be prepared to face the question: "How do I get the window size?"
3. I eventually turned `typescript` into `anyscript`.
4. React loves to re-render.
5. This image of the Beta Processor is recreated by us, and the animation binding process involves using Python to clean the generated SVG and create binding code in React.
