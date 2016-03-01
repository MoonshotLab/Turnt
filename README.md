# Turnt
GET TURNT!


## Non-Node Dependencies
* [ffmpeg](https://www.ffmpeg.org/) - Make sure to install with libvpx and libvorbis `brew reinstall ffmpeg --with-libvpx --with-libvorbis`
* [arduino](https://www.arduino.cc/) with the standard  [firmata](https://www.arduino.cc/en/Reference/Firmata) example installed.
* [kiosk mode](https://github.com/alex-tomin/Tomin.Tools.KioskMode)


## Additional Setup Instructions
Make sure to "unblock" the powershell scripts from the kiosk mode scripts.

I didn't want to deal with bower and didn't want to include dependencies in this repository. You'll need to manually download and include the following client side libraries:
* [jQuery](jquery.com)
* [jsmpeg](https://github.com/phoboslab/jsmpeg)
* [validator](https://github.com/chriso/validator.js)
