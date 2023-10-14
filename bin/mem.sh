#!/bin/bash

free | awk 'NR==2{printf "M:%s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2}'
