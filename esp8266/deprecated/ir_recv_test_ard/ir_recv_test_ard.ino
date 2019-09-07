#include "IRLibAll.h"

IRrecvPCI ir_rec(2);
IRdecode ir_dec;   

void setup() {
  Serial.begin(9600);
  // delay(2000); while (!Serial);
  ir_rec.enableIRIn();
  Serial.println(F("Ready to receive IR signals"));
}

void loop() {
  if (ir_rec.getResults()) {
    ir_dec.decode();
    // ir_dec.dumpResults(false);
    uint32_t val = ir_dec.value;
    switch (val) {
      default:
        Serial.println();
        Serial.print(val);
        break;
    }
    ir_rec.enableIRIn();
  }
}
