# INTRO:
# This file is used to build ferdium-server on windows.
# It also handles any corrupted node modules with the 'CLEAN' env var (set it to 'true' for cleaning)
# It will install the system dependencies except for node and python (which are still verified)
# I sometimes symlink my 'recipes' folder so that any changes that I need to do in it can also be committed and pushed independently
# This file can live anywhere in your PATH

$USERHOME = "${env:HOMEDRIVE}${env:HOMEPATH}"

$env:CI = $true

# -----------------------------------------------------------------------------
#                  Utility functions

Function fail_with_docs {Param ($1)
  Write-Host "*************** FAILING ***************"
  Write-Host "$1"
  Write-Host ""
  Write-Host "Please read the developer documentation in CONTRIBUTING.md"
  exit 1
}

Function Test-CommandExists { Param ($command, $1)
  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = "stop"

  try {
    if(Get-Command $command){RETURN}
  } Catch {
    fail_with_docs $1
  }
  Finally {$ErrorActionPreference=$oldPreference}
}

# -----------------------------------------------------------------------------
#                  Checking the developer environment
# Check for installed programmes
Test-CommandExists node "Node is not installed"
Test-CommandExists npm "npm is not installed"
Test-CommandExists python "Python is not installed"
# NEEDS proper way to CHECK MSVS Tools

# Check node version
$EXPECTED_NODE_VERSION = (cat .nvmrc)
$ACTUAL_NODE_VERSION = (node -v)
if ("v$EXPECTED_NODE_VERSION" -ne $ACTUAL_NODE_VERSION) {
  fail_with_docs "You are not running the expected version of node!
    expected: [v$EXPECTED_NODE_VERSION]
    actual  : [$ACTUAL_NODE_VERSION]"
}

# Check if the 'recipes' folder is present either as a git submodule or a symbolic link
if (-not (Test-Path -Path recipes\package.json -PathType Leaf)) {
  fail_with_docs "'recipes' folder is missing or submodule has not been checked out"
}

# This log statement is only to remind me which 'recipes' folder I am using (symlink or git submodule)
# TODO: Implement this

# -----------------------------------------------------------------------------
# If you are moving to a new version of node or any other system dependency, then cleaning is recommended
# so that there's no irregular results due to cached modules
if ($env:CLEAN -eq "true")
{
  $NPM_PATH = "$USERHOME\AppData\Roaming\npm\node_modules"
  $NPM_CACHE1_PATH = "$USERHOME\AppData\Local\npm-cache"
  $NPM_CACHE2_PATH = "$USERHOME\AppData\Roaming\npm-cache"
  $NODE_GYP = "$USERHOME\AppData\Local\node-gyp"

  Write-Host "Cleaning!"

  if ( (Test-Path -Path ".\pnpm-lock.yaml") -and (Get-Command -ErrorAction Ignore -Type Application pnpm) )
  {
    $PNPM_STORE = "$USERHOME\.pnpm-store"
    $PNPM_STATE = "$USERHOME\.pnpm-state"

    pnpm store prune

    Remove-Item -Path $PNPM_STORE -Recurse -ErrorAction SilentlyContinue
    Remove-Item -Path $PNPM_STATE -Recurse -ErrorAction SilentlyContinue
  }

  npm cache clean --force
  Remove-Item -Path $NPM_PATH -Recurse -ErrorAction SilentlyContinue
  Remove-Item -Path $NPM_CACHE1_PATH -Recurse -ErrorAction SilentlyContinue
  Remove-Item -Path $NPM_CACHE2_PATH -Recurse -ErrorAction SilentlyContinue
  Remove-Item -Path $NODE_GYP -Recurse -ErrorAction SilentlyContinue

  git -C recipes clean -fxd # Clean recipes folder/submodule
  git clean -fxd            # Note: This will blast away the 'recipes' folder if you have symlinked it
}

# -----------------------------------------------------------------------------
# Ensure that the system dependencies are at the correct version - fail if not
# Check python version
$EXPECTED_PYTHON_VERSION = (Get-Content package.json | ConvertFrom-Json).engines.python
$ACTUAL_PYTHON_VERSION = (python --version).trim("Python ")
if ([System.Version]$ACTUAL_PYTHON_VERSION -ne [System.Version]$EXPECTED_PYTHON_VERSION) {
  fail_with_docs "You are not running the expected version of Python!
    expected: [$EXPECTED_PYTHON_VERSION]
    actual  : [$ACTUAL_PYTHON_VERSION]"
}

# Check MSVS Tools through MSVS_VERSION
$EXPECTED_MSVST_VERSION = @("2019","2022")
$NPM_CONFIG_MSVS_VERSION = npm config get msvs_version
if((-not $NPM_CONFIG_MSVS_VERSION) -or -not ($EXPECTED_MSVST_VERSION -contains $NPM_CONFIG_MSVS_VERSION)){
  Write-Host "Your Microsoft Visual Studio Tools isn't set properly or it's not the right version!
              Checking your version..."

  # TODO: Implement path for ARM machines
  $MSVS_REG_PATH = "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\X64"

  if(-not (Test-Path -Path $MSVS_REG_PATH)){
    fail_with_docs "You don't have the Microsoft Visual Studio Tools installed!"
  }

  $MSVS_VERSION =  [int]((Get-ItemProperty -Path $MSVS_REG_PATH).Version.substring(4, 2))
  switch($MSVS_VERSION) {
    { $MSVS_VERSION -ge 30 } {$ACTUAL_MSVST_VERSION = "2022"}
    { ($MSVS_VERSION -ge 20) -and ($MSVS_VERSION -le 29) } {$ACTUAL_MSVST_VERSION = "2019"}
    { $MSVS_VERSION -lt 20 } {$ACTUAL_MSVST_VERSION = "2017 or lower"}
  }

  if (-not ($EXPECTED_MSVST_VERSION -contains $ACTUAL_MSVST_VERSION)) {
    fail_with_docs "You are not running the expected version of MSVS Tools!
    expected: [$EXPECTED_MSVST_VERSION]
    actual  : [$ACTUAL_MSVST_VERSION]"
  }

  Write-Host "Changing your msvs_version on npm to [$ACTUAL_MSVST_VERSION]"
  npm config set msvs_version $ACTUAL_MSVST_VERSION
}

# Check pnpm version
$EXPECTED_PNPM_VERSION = (Get-Content .\recipes\package.json | ConvertFrom-Json).engines.pnpm
$ACTUAL_PNPM_VERSION = Get-Command pnpm --version -ErrorAction SilentlyContinue  # in case the pnpm executable itself is not present
if ($ACTUAL_PNPM_VERSION -ne $EXPECTED_PNPM_VERSION) {
  npm i -gf pnpm@$EXPECTED_PNPM_VERSION
}

$ENV_FILE = ".env"
if (-not (Test-Path -Path $ENV_FILE)) {
  Copy-Item .env.example -Destination $ENV_FILE
  $APP_KEY = ("!@#$%^&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".tochararray() | sort {Get-Random})[0..32] -join ''
  # SAVE APP_KEY TO .env FILE
  (Get-Content $ENV_FILE -Raw) -replace 'APP_KEY=', "APP_KEY=$APP_KEY" | Set-Content $ENV_FILE
}

if (-not (Test-Path -Path "data")) {
  mkdir data
}

# -----------------------------------------------------------------------------
Write-Host "*************** Building recipes ***************"
Push-Location recipes
pnpm i && pnpm lint && pnpm reformat-files && pnpm package
Pop-Location

# -----------------------------------------------------------------------------
# Now the meat.....
& pnpm i
& pnpm prepare
& pnpm lint
# TODO: Uncomment after fixing tests
# & pnpm test

# -----------------------------------------------------------------------------
Write-Host "*************** Starting app ***************"
& node ace migration:refresh
& pnpm start --dev

Write-Host "*************** App successfully stopped! ***************"
