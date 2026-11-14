// city.js: rival team + far-away destination labels (used for "driver is stuck in <place>" flavor)
import fs from 'fs';
const oldDest = '[[`Indiranagar`,`Still looking for parking.`,12.9784,77.6408],[`HSR Layout`,`In a stand-up meeting. Back in five.`,12.9116,77.6474],[`MG Road`,`Metro work in progress.`,12.9756,77.6066],[`Whitefield`,`Still stuck at Marathahalli.`,12.9698,77.75],[`Malleshwaram`,`On its second filter coffee.`,13.0035,77.571],[`Jayanagar`,`Out buying mallige at 4th Block.`,12.925,77.5938],[`Electronic City`,`ETA two hours. Via Silk Board.`,12.8452,77.6602]]';
const newDest = '[[`Bandra`,`Still looking for parking.`,19.0553,72.8402],[`Dadar`,`In a stand-up meeting. Back in five.`,19.0178,72.8478],[`Marine Lines`,`Local was late again.`,18.9500,72.8260],[`Thane`,`Still stuck at Sion.`,19.2183,72.9781],[`Borivali`,`On his second cutting chai.`,19.2307,72.8567],[`Colaba`,`Out buying flowers at the gateway.`,18.9217,72.8347],[`Powai`,`ETA two hours. Via the harbour line.`,19.1176,72.9060]]';
for (const f of ['vendor/city.js', '_source/city.js']) {
  let s = fs.readFileSync(f, 'utf8');
  if (s.includes(oldDest)) {
    s = s.split(oldDest).join(newDest);
  } else console.log(f, 'dest literal NOT found verbatim — checking');
  s = s.split('MYSURU MASALA').join('PUNERI MASALA');
  fs.writeFileSync(f, s);
  console.log(f, 'dest:', s.includes('Bandra'), 'rival:', s.includes('PUNERI'));
}
