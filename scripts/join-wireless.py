import sys
from wireless import Wireless

wireless = Wireless()
wireless.connect(ssid=sys.argv[1], password=sys.argv[2]);
