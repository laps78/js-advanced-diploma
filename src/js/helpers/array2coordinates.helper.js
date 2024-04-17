/**
 * вспомогательная функция преобразования одномерного массива игрового поля
 * в двумерный массив ждя вычисления координат типа (x,y), разбивает массив
 * координат поля на подмассивы и записывает в возвращаемый массив массивов
 * построчно
 * 
 * @param {*} array = массив координат игрового поля 
 * @param {*} fieldLength = длина стороны игрового поля
 * @returns массив массивов
 */
const fieldArray2Coords = (array, fieldLength) => {
    let result = [];
    let row = [];
    let index = 0;
    while (index < array.length) {
        row.push(array[index++]);
        if (row.length === fieldLength) {
            result.push(row);
            row = [];
        }
    }
    return result;
}

export default fieldArray2Coords;