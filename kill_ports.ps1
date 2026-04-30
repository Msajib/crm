$ports = 3000..3010 + 3100
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pIdVal = $conn[0].OwningProcess
        Write-Host "Killing PID $pIdVal on port $port"
        Stop-Process -Id $pIdVal -Force
    }
}
