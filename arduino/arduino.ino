// Code to gather sensor data from a Arduino UNO.
// 2024 - Bit Programming

unsigned char pin = 0;

void setup() {
  // Setup serial output (will be used to communicate to RPi over USB)
  Serial.begin(9600);
  // Setup the analog pin we are using to be used as an input pin
  pinMode(pin, INPUT);
  
}

void loop() {
  // Read the analog pin value and output to the serial console
  Serial.println(analogRead(pin));
  // Wait two seconds before outputting the next sensor reading
  delay(2000);
}
