import serial
import json
import subprocess
from datetime import datetime, timezone
import time


if __name__ == '__main__':
    arduino = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
    arduino.reset_input_buffer()
    while True:
        with open('data.json', 'r+') as f:
            data = json.load(f)
        if arduino.in_waiting > 0:
            lines = arduino.readlines()
            data['readings'].append({"time": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "level": lines[-1].decode('utf-8').strip()})

        with open('data.json', 'w') as f:
            json.dump(data, f)
        time.sleep(2.0)
    
