# Turnt
The node application which powers the [turnt video booth](take5remixbooth.squarespace.com).

![booth-back](http://i.imgur.com/2jCYxKy.jpg)

It:
* Processes data from an [American Audio VMS2](http://www.americandj.eu/en/vms2.html) and makes it available via TCP interface
* Consumes and captures a video feed from a usb camera
* Controls the interface flow
* Controls an [arduino](https://www.arduino.cc/) to power lights and other interface elements
* Powers multiple interfaces


## Non-Node Dependencies
* [ffmpeg](https://www.ffmpeg.org/) - Make sure to install with libvpx and libvorbis `brew reinstall ffmpeg --with-libvpx --with-libvorbis`
* [arduino](https://www.arduino.cc/) with the standard  [firmata](https://www.arduino.cc/en/Reference/Firmata) example installed.
* [kiosk mode](https://github.com/alex-tomin/Tomin.Tools.KioskMode) if running on Windoze.


![booth-interface](http://i.imgur.com/pQ3TUFr.jpg)


## Additional Setup Instructions
When running on Windoze, make sure to "unblock" the powershell scripts from the kiosk mode scripts.

I didn't want to deal with bower and didn't want to include dependencies in this repository. You'll need to manually download and include the following client side libraries:
* [jQuery](jquery.com)
* [jsmpeg](https://github.com/phoboslab/jsmpeg)
* [validator](https://github.com/chriso/validator.js)


![](http://i.imgur.com/SeO2i3s.jpg)
![](http://i.imgur.com/BmgoKWK.jpg)
![](http://i.imgur.com/aY1800Z.jpg)
