export function getUploader(component) {
    let parent = component.$parent
    while (parent) {
        if (parent.uploader) {
            return parent.uploader
        } else {
            parent = parent.$parent
        }
    }
    return null
}

export function secondsToStr(temp) {
    const years = Math.floor(temp / 31536000)
    if (years) {
        return years + ' year' + numberEnding(years)
    }
    const days = Math.floor((temp %= 31536000) / 86400)
    if (days) {
        return days + ' day' + numberEnding(days)
    }
    const hours = Math.floor((temp %= 86400) / 3600)
    if (hours) {
        return hours + ' hour' + numberEnding(hours)
    }
    const minutes = Math.floor((temp %= 3600) / 60)
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes)
    }
    const seconds = temp % 60
    return seconds + ' second' + numberEnding(seconds)

    function numberEnding(number) {
        return (number > 1) ? 's' : ''
    }
}

export function kebabCase(s) {
    return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

function add0(m) { return m < 10 ? '0' + m : m };
export function formatDate(timestamp) {
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        timestamp = timestamp.replace("-", "/");
    }
    let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    return Y + M + add0(D) + ' ' + add0(h) + ':' + add0(m) + ':' + add0(s);
};