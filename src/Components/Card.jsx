import { TiDeleteOutline } from "react-icons/ti";

const Card = ({ id, title, desc, deleteNote }) => {
  return (
    <div className='card'>
      <div className='del' onClick={() => deleteNote(id)}>
       <TiDeleteOutline />
      </div>
      <div className="title">{title}</div>
      <div className="desc">{desc}</div>
    </div>
  );
}

export default Card;
