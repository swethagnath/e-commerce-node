const deleteProduct = btn => {
  const csrf           = btn.parentNode.querySelector('[name="_csrf"]').value
  const productId      = btn.parentNode.querySelector('[name="productId"]').value
  const productElement = btn.closest('.card')

  fetch('/admin//delete-products/' + productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })

  .then(result => {
    return result.json()
  })
  .then(data => {
    productElement.parentNode.removeChild(productElement)
  })

  .catch(err => {
    console.log(err)
  })

}
