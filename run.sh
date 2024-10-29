#!/bin/bash

/bin/sh -ec 'cd app && npm run dev' &
/bin/sh -ec 'cd api/activeGame/src && npm run dev' &
/bin/sh -ec 'cd api/votes/src && npm run dev' &
