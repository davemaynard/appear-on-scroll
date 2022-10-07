# appear-on-scroll
Show elements as they enter the browser viewport on scroll.

## Getting Started
To get up and running quickly, download the [minified script](https://raw.githubusercontent.com/dmaynard24/appear-on-scroll/master/dist/appear-on-scroll.min.js) and add it to any page.

    <script src="path/to/script/appear-on-scroll.min.js" type="text/javascript"></script>

Then, after loading the script, initialize it:

    <script type="text/javascript">
	    const appearOnScroll = new AppearOnScroll(`.appear-on-scroll-component`, {
		    duration: 850,
		    slideDistance: `10px`,
		    once: true,
	    });
    </script>

The first parameter of the function is ``selector`` and it takes any CSS selector as an argument. The second parameter is ``options`` and it takes an object as an argument. In the example above I'm overriding some of the default option values, but you may omit any of them to simply use the defaults.

## Options
| Key | Value Type | Default Value | Description |
|:-|:-|:-|:-|
| `delay` | Number | `0` | Delay (in milliseconds) before the element will be shown after entering the browser viewport. 
| `duration` | Number | `600` | Duration (in milliseconds) of the animation to show the element. 
| `easing` | String | `cubic-bezier(0.5, 0, 0, 1)` | Duration (in milliseconds) of the animation to show the element. 
| `once` | Boolean | `false` | Whether or not the element will be hidden and shown again upon leaving and reentering the browser viewport. 
| `slide` | Boolean | `true` | Whether or not the element will "slide" into place as it's being shown. This is dependent on scroll direction to give it a more natural feel. 
| `slideDistance` | String | `25px` | How far the element will "slide" into place as it's being shown. This property is dependent on the **slide** property being set to **true**.
| `throttleDelay` | Number | `0` | Every scroll event is throttled — it may only fire once every so often — to improve performance. This value is the delay (in milliseconds) between each scroll event firing. I recommend never setting a value over 250.

## Authors
**Dave Maynard** - [GitHub](https://github.com/dmaynard24)  
**Joey Pike** - [GitHub](https://github.com/jpike97)