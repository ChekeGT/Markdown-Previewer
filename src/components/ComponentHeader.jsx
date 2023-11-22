import '../sass/ComponentHeader.sass'
export default function ComponentHeader({title, toggleOpenState, openState}){
    return (
        <div className="component-header">
                <div className="icon-and-text-container">
                    <i className="fa fa-free-code-camp"></i>
                    <p>{title}</p>
                </div>
                <i onClick={toggleOpenState} className={`open-and-close-editor-button fa ${openState ? 'fa-compress' : 'fa-arrows-alt'}`}></i>
        </div>
    )
}