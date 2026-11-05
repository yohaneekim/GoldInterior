$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$env:ADMIN_USER = Read-Host '관리자 아이디'
$goldPassword = Read-Host '관리자 비밀번호 (12자 이상)' -AsSecureString
$goldPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($goldPassword)
try {
    $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($goldPointer)
    node setup-admin.mjs
    if ($LASTEXITCODE -ne 0) { throw '관리자 계정을 만들지 못했습니다. 입력 내용 또는 기존 계정 파일을 확인해 주세요.' }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($goldPointer)
    Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_USER -ErrorAction SilentlyContinue
}
