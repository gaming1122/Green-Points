
import React from 'react';

const IotSpecView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 glass shadow-2xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <i className="fas fa-bluetooth-b text-indigo-500"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter">ESP32 + IR Master Logic</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mono">FIRMWARE CORE v2.2 / REWARD_POINT_LINK</p>
            </div>
          </div>
          <div className="bg-[#05070a] rounded-3xl p-8 font-mono text-[10px] text-emerald-400/90 overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-hide border border-white/5 shadow-inner leading-relaxed">
            <pre>{`/**
 * GreenPoints Smart Ingestion Terminal
 * BLE Service: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
 * XP Payout: 25 XP per Detection
 */

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

const int IR_SENSOR_PIN = 34; // Connect IR OUT to GPIO 34
BLECharacteristic *pXpSignal;
bool deviceConnected = false;

void setup() {
  Serial.begin(115200);
  pinMode(IR_SENSOR_PIN, INPUT);

  // Initialize BLE Device
  BLEDevice::init("GP-Bin-Node-01");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  
  // Setup XP Broadcast Characteristic
  pXpSignal = pService->createCharacteristic(
                CHARACTERISTIC_UUID,
                BLECharacteristic::PROPERTY_NOTIFY
              );
  
  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("GP Node Ready. Broadcasting...");
}

void loop() {
  // Check IR state (Active LOW for typical IR sensors)
  if (digitalRead(IR_SENSOR_PIN) == LOW) {
    Serial.println("BOTTLE_DETECTED -> EMITTING 25 XP SIGNAL");
    
    // Broadcast 'B' to the paired web session
    pXpSignal->setValue("B");
    pXpSignal->notify();
    
    // Debounce: 2 second delay to prevent multi-counts
    delay(2000); 
  }
  delay(100);
}`}</pre>
          </div>
        </section>

        <section className="bg-[#0f1115] p-10 rounded-[3rem] border border-white/5 glass shadow-2xl">
          <h3 className="text-2xl font-black text-white mb-10 tracking-tighter uppercase flex items-center">
             <i className="fas fa-microchip mr-4 text-emerald-500"></i> Protocol Specifications
          </h3>
          <div className="space-y-6">
            <HardwareItem 
              title="Reward Payout" 
              desc="25 XP / Detection" 
              details="Digital IR signals are translated into 'B' character payloads over Bluetooth Low Energy. The web interface increments points by 25 and bottles by 1."
            />
            <HardwareItem 
              title="Sensor Calibration" 
              desc="Infrared Proximity" 
              details="Optimized for clear and colored PET plastic detection with adjustable range sensitivity on the E18-D80NK module."
            />
            <HardwareItem 
              title="Identity Binding" 
              desc="Session Pair-Lock" 
              details="Point injection is only authorized for the logged-in Identity ID. Cross-node spoofing is rejected at the app layer."
            />
             <HardwareItem 
              title="Wireless Spectrum" 
              desc="BLE 4.2 GATT" 
              details="Uses Generic Attribute Profile (GATT) notifications for ultra-low latency (<50ms) reward processing."
            />
          </div>
          
          <div className="mt-12 p-10 bg-emerald-500 rounded-[3rem] shadow-2xl text-slate-900 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-7xl group-hover:scale-125 transition-transform duration-700">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="flex items-center space-x-4 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
              <i className="fas fa-microchip"></i>
              <span>Hardware Handshake Active</span>
            </div>
            <p className="text-sm leading-relaxed font-black uppercase tracking-tight">
              Pair your student identity with any active GP-Bin node. Every item you recycle is instantly verified and converted into 25 XP, syncing directly to your global sustainability rank.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

const HardwareItem: React.FC<{title: string; desc: string; details: string}> = ({title, desc, details}) => (
  <div className="bg-[#05070a] p-8 rounded-[2rem] border border-white/5 group hover:border-emerald-500/40 transition-all cursor-default shadow-lg">
    <div className="flex justify-between items-baseline mb-3">
      <span className="text-sm font-black text-white uppercase tracking-tighter">{title}</span>
      <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-xl mono uppercase tracking-widest">{desc}</span>
    </div>
    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed">{details}</p>
  </div>
);

export default IotSpecView;
