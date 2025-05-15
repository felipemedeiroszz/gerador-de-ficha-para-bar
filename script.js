document.addEventListener('DOMContentLoaded', function() {
    const gerarFichasBtn = document.getElementById('gerarFichas');
    const imprimirBtn = document.getElementById('imprimir');
    const voltarBtn = document.getElementById('voltar');
    const fichasPreview = document.getElementById('fichas-preview');
    const formContainer = document.querySelector('.form-container');
    const fichasContainer = document.getElementById('fichas-container');
    const historicoList = document.getElementById('historico-list');
    const logoUpload = document.getElementById('logoUpload');
    const logoCustomRadio = document.getElementById('logoCustom');
    
    // Variáveis para armazenar logo personalizado
    let customLogoUrl = null;
    
    // Carregar histórico do localStorage
    let historicoFichas = JSON.parse(localStorage.getItem('historicoFichas')) || [];
    
    // Exibir histórico inicial
    atualizarHistorico();
    
    gerarFichasBtn.addEventListener('click', gerarFichas);
    imprimirBtn.addEventListener('click', imprimirFichas);
    voltarBtn.addEventListener('click', voltarFormulario);
    
    // Evento para o upload de logo
    document.querySelector('.upload-logo').addEventListener('click', function() {
        logoUpload.click();
    });
    
    logoUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                customLogoUrl = event.target.result;
                
                // Criar preview e selecionar a opção
                const previewContainer = document.querySelector('.custom-logo label');
                previewContainer.innerHTML = `<img src="${customLogoUrl}" alt="Logo personalizado" style="width:80px;height:80px;">`;
                
                logoCustomRadio.checked = true;
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    function gerarFichas() {
        const nome = document.getElementById('nome').value || 'Meu Bar';
        const valor = parseFloat(document.getElementById('valor').value) || 10;
        const quantidade = parseInt(document.getElementById('quantidade').value) || 4;
        let logoSelecionada = document.querySelector('input[name="logo"]:checked').value;
        const cor = document.getElementById('cor').value;
        const corTexto = document.getElementById('corTexto').value;
        
        // Verificar se é logo personalizado ou nenhuma logo
        if (logoSelecionada === 'custom') {
            logoSelecionada = customLogoUrl;
        }
        
        // Limpar fichas anteriores
        fichasContainer.innerHTML = '';
        
        // Criar novas fichas
        for (let i = 0; i < quantidade; i++) {
            const ficha = document.createElement('div');
            ficha.className = 'ficha';
            ficha.style.backgroundColor = cor;
            
            // Condicional para renderizar logo
            const logoHtml = logoSelecionada !== 'none' 
                ? `<img src="${logoSelecionada}" alt="Logo" class="ficha-logo">` 
                : '';
            
            ficha.innerHTML = `
                ${logoHtml}
                <div class="ficha-nome" style="color: ${corTexto}">${nome}</div>
                <div class="ficha-valor" style="color: ${corTexto}">R$ ${valor.toFixed(2)}</div>
            `;
            
            fichasContainer.appendChild(ficha);
        }
        
        // Salvar no histórico
        salvarNoHistorico({
            nome,
            valor,
            quantidade,
            logoSelecionada,
            cor,
            corTexto,
            data: new Date().toLocaleString()
        });
        
        // Mostrar preview e esconder formulário
        formContainer.style.display = 'none';
        fichasPreview.classList.remove('hidden');
    }
    
    function salvarNoHistorico(ficha) {
        // Adicionar ao início do array (mais recente primeiro)
        historicoFichas.unshift(ficha);
        
        // Limitar o histórico a 10 itens para não sobrecarregar o localStorage
        if (historicoFichas.length > 10) {
            historicoFichas.pop();
        }
        
        // Salvar no localStorage
        localStorage.setItem('historicoFichas', JSON.stringify(historicoFichas));
        
        // Atualizar exibição do histórico
        atualizarHistorico();
    }
    
    function atualizarHistorico() {
        historicoList.innerHTML = '';
        
        if (historicoFichas.length === 0) {
            historicoList.innerHTML = '<p class="historico-vazio">Nenhuma ficha criada ainda.</p>';
            return;
        }
        
        historicoFichas.forEach((ficha, index) => {
            const item = document.createElement('div');
            item.className = 'historico-item';
            item.style.borderLeftColor = ficha.cor;
            
            item.innerHTML = `
                <div class="historico-info">
                    <strong>${ficha.nome}</strong>
                    <span>R$ ${ficha.valor.toFixed(2)} - ${ficha.quantidade} fichas</span>
                    <small>${ficha.data}</small>
                </div>
                <div class="historico-acoes">
                    <button class="btn-imprimir" data-index="${index}">Imprimir</button>
                    <button class="btn-excluir" data-index="${index}">Excluir</button>
                </div>
            `;
            
            historicoList.appendChild(item);
        });
        
        // Adicionar eventos aos botões de excluir e imprimir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                excluirFicha(index);
            });
        });
        
        document.querySelectorAll('.btn-imprimir').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                imprimirFichaHistorico(index);
            });
        });
    }
    
    function excluirFicha(index) {
        // Remover a ficha do array
        historicoFichas.splice(index, 1);
        
        // Atualizar o localStorage
        localStorage.setItem('historicoFichas', JSON.stringify(historicoFichas));
        
        // Atualizar a exibição do histórico
        atualizarHistorico();
    }

    function imprimirFichas() {
        window.print();
    }
    
    function voltarFormulario() {
        formContainer.style.display = 'flex';
        fichasPreview.classList.add('hidden');
    }

    function imprimirFichaHistorico(index) {
        const ficha = historicoFichas[index];
        
        // Limpar fichas anteriores
        fichasContainer.innerHTML = '';
        
        // Criar fichas baseadas no histórico
        for (let i = 0; i < ficha.quantidade; i++) {
            const fichaElement = document.createElement('div');
            fichaElement.className = 'ficha';
            fichaElement.style.backgroundColor = ficha.cor;
            
            // Condicional para renderizar logo
            const logoHtml = ficha.logoSelecionada !== 'none' 
                ? `<img src="${ficha.logoSelecionada}" alt="Logo" class="ficha-logo">` 
                : '';
            
            fichaElement.innerHTML = `
                ${logoHtml}
                <div class="ficha-nome" style="color: ${ficha.corTexto}">${ficha.nome}</div>
                <div class="ficha-valor" style="color: ${ficha.corTexto}">R$ ${ficha.valor.toFixed(2)}</div>
            `;
            
            fichasContainer.appendChild(fichaElement);
        }
        
        // Mostrar preview e esconder formulário
        formContainer.style.display = 'none';
        fichasPreview.classList.remove('hidden');
    }
    
    // Add new button for PDF export
    const exportPdfBtn = document.createElement('button');
    exportPdfBtn.id = 'exportPdf';
    exportPdfBtn.textContent = 'Exportar PDF';
    exportPdfBtn.style.backgroundColor = '#FF9800';
    document.querySelector('.actions').appendChild(exportPdfBtn);

    // PDF Export functionality
    exportPdfBtn.addEventListener('click', function() {
        const element = document.getElementById('fichas-container');
        const opt = {
            margin:       10,
            filename:     `fichas_${document.getElementById('nome').value || 'bar'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    });
});
