// libraries
#include <Arduino.h>
#include <IRrecv.h>
#include <IRremoteESP8266.h>
#include <IRac.h>
#include <IRutils.h>

// ir vars
const uint16_t ir_pin = 14;
const uint16_t ir_buffer = 1024;
const uint8_t ir_timeout = 15;
IRrecv ir_rec(ir_pin, ir_buffer, ir_timeout, true);
decode_results ir_dec;

void setup() {
  Serial.begin(115200, SERIAL_8N1);
  while (!Serial) delay(50);
  Serial.printf("\nir_recDumpV2 is now running and waiting for IR input on Pin %d\n", ir_pin);
  ir_rec.enableIRIn();
}

void loop() {
  if (ir_rec.decode(&ir_dec)) {
    if (!ir_dec.overflow) {
      uint64_t val = ir_dec.value;
      switch (val) {
        case 551489775:
          Serial.print(F("\n power "));
          break;
        case 551547915:
          Serial.print(F("\n input "));
          break;
        case 551507880:
          Serial.print(F("\n amazon "));
          break;
        case 551540520:
          Serial.print(F("\n netflix "));
          break;
        case 551532360:
          Serial.print(F("\n mgo "));
          break;
        case 551529555:
          Serial.print(F("\n rewind "));
          break;
        case 551545875:
          Serial.print(F("\n pause "));
          break;
        case 551537715:
          Serial.print(F("\n play "));
          break;
        case 551513235:
          Serial.print(F("\n forward "));
          break;
        case 551525475:
          Serial.print(F("\n captions "));
          break;
        case 551496915:
          Serial.print(F("\n record "));
          break;
        case 551488755:
          Serial.print(F("\n stop "));
          break;
        case 551540775:
          Serial.print(F("\n info "));
          break;
        case 551527005:
          Serial.print(F("\n up "));
          break;
        case 551510685:
          Serial.print(F("\n down "));
          break;
        case 551490285:
          Serial.print(F("\n right "));
          break;
        case 551543325:
          Serial.print(F("\n left "));
          break;
        case 551494365:
          Serial.print(F("\n select "));
          break;
        case 551522925:
          Serial.print(F("\n exit "));
          break;
        case 551547405:
          Serial.print(F("\n menu "));
          break;
        case 551506605:
          Serial.print(F("\n back "));
          break;
        case 551499975:
          Serial.print(F("\n guide "));
          break;
        case 551504565:
          Serial.print(F("\n yellow "));
          break;
        case 551537205:
          Serial.print(F("\n blue "));
          break;
        case 551496405:
          Serial.print(F("\n red "));
          break;
        case 551529045:
          Serial.print(F("\n green "));
          break;
        case 551502015:
          Serial.print(F("\n volume + "));
          break;
        case 551534655:
          Serial.print(F("\n volume - "));
          break;
        case 551485695:
          Serial.print(F("\n channel up "));
          break;
        case 551518335:
          Serial.print(F("\n channel down "));
          break;
        case 551531595:
          Serial.print(F("\n vizio "));
          break;
        case 551522415:
          Serial.print(F("\n mute "));
          break;
        case 551508135:
          Serial.print(F("\n return "));
          break;
        case 551520375:
          Serial.print(F("\n 1 "));
          break;
        case 551504055:
          Serial.print(F("\n 2 "));
          break;
        case 551536695:
          Serial.print(F("\n 3 "));
          break;
        case 551495895:
          Serial.print(F("\n 4 "));
          break;
        case 551528535:
          Serial.print(F("\n 5 "));
          break;
        case 551512215:
          Serial.print(F("\n 6 "));
          break;
        case 551544855:
          Serial.print(F("\n 7 "));
          break;
        case 551491815:
          Serial.print(F("\n 8 "));
          break;
        case 551524455:
          Serial.print(F("\n 9 "));
          break;
        case 551487735:
          Serial.print(F("\n 0 "));
          break;
        case 551546385:
          Serial.print(F("\n wide "));
          break;
        case 551550720:
          Serial.print(F("\n — "));
          break;
        case 4294967295:
        case 18446744073709551615:
          Serial.print(".");
          break;
        default:
          Serial.println();
          Serial.print(' ');
          serialPrintUint64(val, 10);
          break;
      }
      ir_rec.resume();
    }
  }
}
