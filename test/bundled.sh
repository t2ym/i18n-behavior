#!/bin/sh

rm -rf bundled
cp -rvf preprocess3 bundled

for i in basic edge-case multiple-case template-default-lang preference no-persist; do {
  echo Building bundled $i;
  sed -e "s/test-name/${i}/g" base-polymer.json >polymer.json
  polymer build --root=..
  cp -vf build/esm-bundled/bundled/${i}-test-imports.js bundled/${i}-test-imports.js
} done

rm -vf polymer.json
rm -rvf build
