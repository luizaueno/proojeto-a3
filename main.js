import { emojis, pessoas } from './dados.js' ; 

document.addEventListener( 'DOMContentLoaded' , () => { 
    const botao = document.getElementById( 'botao' ); 
    if (botao) { 
        botao.addEventListener( 'click' , traduzir); 
    } 
}); 

function substituirHashtags(texto, erros, contadores) { 
    const padrao = /(?<![\w.])#([\wÀ-ÿ]+)(?::([\wÀ-ÿ]+))?/g; 
    return texto.replace(padrao, function (trecho, categoria, valor) { 
        if (valor === undefined) { 
            erros.push( 'Hashtag em formato inválido: ' + trecho + ' (use #categoria:valor)' ); 
            return marcarErro(trecho); 
        } 
        const chave = (categoria + ':' + valor).toLowerCase(); 
        if (!Object.hasOwn(emojis, chave)) { 
            erros.push( 'Hashtag desconhecida: ' + trecho); 
            return marcarErro(trecho); 
        } 
        
        contadores.hashtags += 1;
        return emojis[chave]; 
    }); 
} 

function escaparHtml(texto) { 
    return texto 
        .replace(/&/g, '&amp;' ) 
        .replace(/</g, '&lt;' ) 
        .replace(/>/g, '&gt;' ); 
} 

function traduzir() { 
    const erros = [];
    const contadores = { mencoes: 0, hashtags: 0 }; 
    
    let texto = escaparHtml(document.getElementById( 'entrada' ).value); 
    texto = substituirMencoes(texto, erros, contadores); 
    texto = substituirHashtags(texto, erros, contadores); 
    document.getElementById( 'saida' ).innerHTML = texto; 
    
    mostrarContadores(contadores);

    const lista = document.getElementById( 'erros' ); 
    lista.innerHTML = ''; 
    if (erros.length === 0) { 
        lista.innerHTML = '<li>Nenhum erro encontrado.</li>' ; 
    } 
    for (const mensagem of erros) { 
        const item = document.createElement( 'li' ); 
        item.className = 'erro' ; 
        item.textContent = mensagem; 
        lista.appendChild(item); 
    } 
} 

function marcarErro(trecho) { 
    return '<span class="erro">' + trecho + '</span>' ; 
} 

function substituirMencoes(texto, erros, contadores) { 

    const padrao = /(?<![\w.])@([\wÀ-ÿ]+(?:\.[\wÀ-ÿ]+)*)/g; 
    return texto.replace(padrao, function (trecho, usuario) { 
        const chave = usuario.toLowerCase(); 
        if (!Object.hasOwn(pessoas, chave)) { 
            erros.push( 'Menção desconhecida: ' + trecho); 
            return marcarErro(trecho); 
        } 
        
        contadores.mencoes += 1; 
        return pessoas[chave]; 
    }); 
}


function mostrarContadores(contadores) {
    const container = document.getElementById('contadores');
    if (container) {
        container.innerHTML = `
            Menções traduzidas com sucesso: ${contadores.mencoes} <br>
            Hashtags traduzidas com sucesso: ${contadores.hashtags}
        `;
    }
}

