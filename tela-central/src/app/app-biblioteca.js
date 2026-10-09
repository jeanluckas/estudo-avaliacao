import { Stack, router } from "expo-router";
import { StyleSheet, Text, View, Button, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("biblioteca.db");

db.execSync(`
    CREATE TABLE IF NOT EXISTS livro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(255) NOT NULL,
        autor VARCHAR(255) NOT NULL,
        paginas INTEGER NOT NULL
  );
`);

function listar() {
    return db.getAllSync("SELECT * FROM livro ORDER BY id DESC");
}

function salvar(titulo, autor, paginas) {
    db.runSync("INSERT INTO livro (titulo, autor, paginas) VALUES (?, ?, ?)", [titulo, autor, paginas]);
}

function excluir(codigo) {
    db.runSync("DELETE FROM livro WHERE id = ?", [codigo]);
}

function edita(titulo, autor, paginas, id) {
    db.runSync("UPDATE livro SET titulo = ?, autor = ?, paginas = ? WHERE id = ?", [
        titulo,
        autor,
        paginas,
        id,
    ]);
}


export default function App() {

    const [titulo, setTitulo] = useState("");
    const [autor, setAutor] = useState("");
    const [paginas, setPaginas] = useState("");
    const [lista, setLista] = useState([]);
    const [idEditando, setIdEditando] = useState(0);


    function carregar() {
        setLista(listar());
    }

    function guardarOuEditar() {
        if (idEditando === 0) {
            salvar(titulo, autor, paginas);
        } else {
            edita(titulo, autor, paginas, idEditando);
        }
        setTitulo("");
        setAutor("");
        setPaginas("");
        setIdEditando(0);
        carregar();
    }

    function remover(codigo) {
        excluir(codigo);
        carregar();
    }

    function editar(livro) {
        setIdEditando(livro.id);
        setTitulo(livro.titulo);
        setAutor(livro.autor);
        setPaginas(String(livro.paginas));

    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <SafeAreaView style={styles.main}>
            <Stack.Screen options={{ title: "App Biblioteca" }} />
            <Text style={styles.titulo}>Cadastro de Livros</Text>
            <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Titulo do Livro"
                placeholderTextColor="#555"
            />
            <TextInput
                style={styles.input}
                value={autor}
                onChangeText={setAutor}
                placeholder="Nome do Autor"
                placeholderTextColor="#555"
            />

            <TextInput
                style={styles.input}
                value={paginas}
                onChangeText={setPaginas}
                placeholder="Quantidade de Páginas"
                placeholderTextColor="#555"
            />

            <View style={styles.botao}>
                <Button title="Salvar" color="#000000" onPress={guardarOuEditar} />
            </View>

            <FlatList
                style={styles.lista}
                data={lista}
                renderItem={({ item }) => (
                    <View style={styles.caixaLista}>
                        <View>
                            <Text style={styles.item}>Titulo: {item.titulo}</Text>
                            <Text style={styles.item}>Autor: {item.autor}</Text>
                            <Text style={styles.item}>Páginas: {item.paginas}</Text>

                        </View>
                        <View>
                            <Button title="Editar" color="#000000" onPress={() => editar(item)} />
                            <Button title="Excluir" color="#000000" onPress={() => remover(item.id)} />
                        </View>
                    </View>)
                }
            />

            < Button title="VOLTAR" onPress={() => router.back()} />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: "flex-start",
        gap: 10
    },

    titulo: {
        fontWeight: "bold",
        fontSize: 25
    },

    input: {
        borderWidth: 1,
        borderColor: "#D9DDE3",
        borderRadius: 12,
        width: 300,
        padding: 12,
        fontSize: 16,
        color: "#111827",
        marginBottom: 12,
    },

    caixaLista: {
        backgroundColor: "#ffffff",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-around",
        flexDirection: "row",
        padding: 5,
        borderWidth: 1,
        borderColor: "#000000",
        marginBottom: 8
    },

    botao: {
        backgroundColor: "#d5f2f3",
        borderRadius: 15,
        width: 150,
        borderColor: "#000000",
        borderWidth: 1

    },

    lista: {
        padding: 10,
    }
});
