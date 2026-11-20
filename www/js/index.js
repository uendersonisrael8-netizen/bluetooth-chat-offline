document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-plugin-bluetooth-serial');
    loadPairedDevices();
    
    // Inicia a escuta por dados recebidos
    bluetoothSerial.subscribe('\n', function (data) {
        appendMessage(data, 'incoming');
    }, function (err) {
        console.log("Erro no subscribe: " + err);
    });
}

function enableBluetooth() {
    bluetoothSerial.enable(
        function() {
            alert("Bluetooth ativado com sucesso!");
            loadPairedDevices();
        },
        function() {
            alert("Bluetooth não foi ativado.");
        }
    );
}

function loadPairedDevices() {
    document.getElementById('status-paired').innerText = 'Buscando pareados...';
    bluetoothSerial.list(
        function(devices) {
            var list = document.getElementById('paired-list');
            list.innerHTML = '';
            if (devices.length === 0) {
                document.getElementById('status-paired').innerText = 'Nenhum dispositivo pareado encontrado.';
                return;
            }
            document.getElementById('status-paired').innerText = devices.length + ' dispositivo(s) pareado(s)';
            devices.forEach(function(device) {
                var li = document.createElement('li');
                li.innerHTML = `<span><b>${device.name || 'Desconhecido'}</b><br><small>${device.address}</small></span>` +
                               `<button style="width: auto; margin-top: 0; padding: 6px 12px;" onclick="connect('${device.address}', '${device.name || 'Dispositivo'}')">Conectar</button>`;
                list.appendChild(li);
            });
        },
        function(error) {
            document.getElementById('status-paired').innerText = 'Erro ao carregar pareados.';
            console.log(error);
        }
    );
}

function discoverDevices() {
    var list = document.getElementById('discovered-list');
    list.innerHTML = '';
    document.getElementById('status-discovered').innerText = 'Procurando dispositivos próximos...';

    bluetoothSerial.discoverUnpaired(
        function(devices) {
            if (devices.length === 0) {
                document.getElementById('status-discovered').innerText = 'Nenhum dispositivo novo encontrado.';
                return;
            }
            document.getElementById('status-discovered').innerText = devices.length + ' dispositivo(s) encontrado(s)';
            devices.forEach(function(device) {
                var li = document.createElement('li');
                li.innerHTML = `<span><b>${device.name || 'Desconhecido'}</b><br><small>${device.address}</small></span>` +
                               `<button style="width: auto; margin-top: 0; padding: 6px 12px;" onclick="connect('${device.address}', '${device.name || 'Dispositivo'}')">Conectar</button>`;
                list.appendChild(li);
            });
        },
        function(error) {
            document.getElementById('status-discovered').innerText = 'Erro na busca. Verifique permissões/GPS.';
            console.log(error);
        }
    );
}

function connect(address, name) {
    alert("Conectando a " + name + "...");
    bluetoothSerial.connect(
        address,
        function() {
            document.getElementById('device-screen').style.display = 'none';
            document.getElementById('chat-screen').style.display = 'flex';
            document.getElementById('connected-device-name').innerText = 'Conectado a: ' + name;
            document.getElementById('messages').innerHTML = '';
            appendMessage("Conectado com sucesso!", 'incoming');
        },
        function(error) {
            alert("Falha na conexão: " + JSON.stringify(error));
        }
    );
}

function disconnect() {
    bluetoothSerial.disconnect(
        function() {
            document.getElementById('chat-screen').style.display = 'none';
            document.getElementById('device-screen').style.display = 'block';
            loadPairedDevices();
        },
        function(error) {
            console.log("Erro ao desconectar: " + error);
        }
    );
}

function sendMessage() {
    var input = document.getElementById('message-input');
    var text = input.value.trim();
    if (text === '') return;

    bluetoothSerial.write(
        text + '\n',
        function() {
            appendMessage(text, 'outgoing');
            input.value = '';
        },
        function(error) {
            alert("Erro ao enviar mensagem: " + JSON.stringify(error));
        }
    );
}

function handleKeyPress(e) {
    if (e.keyCode === 13) {
        sendMessage();
    }
}

function appendMessage(text, type) {
    var messagesDiv = document.getElementById('messages');
    var msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + type;
    msgDiv.innerText = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
